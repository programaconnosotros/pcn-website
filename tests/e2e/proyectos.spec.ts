import type { Page } from '@playwright/test';
import type { PrismaClient } from '../../src/generated/prisma/client';
import { PROJECT } from './support/data';
import { createUser, expireCachedReads, signIn, uniqueId } from './support/content-helpers';
import { expect as baseExpect, test } from './support/fixtures';

// El servidor e2e es un build de producción compartido: con carga, cada paso puede tardar.
test.describe.configure({ timeout: 120_000 });
const expect = baseExpect.configure({ timeout: 30_000 });

// Proyectos: publicar, validar, permisos de autor/colaborador/visitante, filtros y el orden curado.
// Los proyectos que se crean llevan ids `e2e-pro-…`; el sembrado (PROJECT) solo se lee.

/** La tarjeta de un proyecto en /proyectos, por su título. */
const projectCard = (page: Page, title: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { name: title }) });

/** Crea un proyecto al final de la lista, como lo haría createProject. */
const createProject = async (
  db: PrismaClient,
  data: {
    title: string;
    authorId: string;
    members?: { userId: string | null; memberName: string; role?: string }[];
    isOpenSource?: boolean;
    techStack?: string[];
  },
) => {
  const last = await db.project.aggregate({ _max: { order: true } });
  return db.project.create({
    data: {
      id: uniqueId('e2e-pro'),
      title: data.title,
      description: `Descripción de ${data.title}.`,
      url: 'https://example.com/e2e-pro',
      logoUrl: '',
      isOpenSource: data.isOpenSource ?? false,
      techStack: data.techStack ?? [],
      authorId: data.authorId,
      order: (last._max.order ?? -1) + 1,
      members: { create: data.members ?? [] },
    },
  });
};

const openActions = async (page: Page, title: string) => {
  await projectCard(page, title)
    .getByRole('button', { name: `Acciones de ${title}` })
    .click();
};

test.describe('con un usuario propio', () => {
  test('TC-PRO-001 Publicar un proyecto open-source', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    const teammate = await createUser(db, 'e2e-pro', { name: `Compañera ${uniqueId('pro')}` });
    await signIn(page, author);
    await page.goto('/proyectos');

    await page.getByRole('button', { name: 'publicarProyecto();' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo proyecto' });
    const title = `Proyecto ${uniqueId('e2e-pro')}`;
    await dialog.getByLabel('Nombre del proyecto').fill(title);
    await dialog
      .getByLabel('Descripción')
      .fill('Una herramienta open-source creada en la suite e2e.');
    await dialog.getByLabel('URL del proyecto').fill('https://example.com/e2e-pro-nuevo');
    await dialog.getByLabel('Es open-source').check();
    await dialog.getByLabel('Repositorio en GitHub').fill('https://github.com/example/e2e-pro');
    await dialog.getByLabel('Año de inicio').fill('2023');
    await dialog.getByLabel('Año de cierre').fill('2025');

    const tech = dialog.getByPlaceholder('Ej: Next.js, PostgreSQL...');
    await tech.fill('E2eStack');
    await tech.press('Enter');
    await tech.fill('Postgres');
    await tech.press('Enter');
    await expect(dialog.getByText('E2eStack')).toBeVisible();

    const search = dialog.getByPlaceholder('Buscar compañeros por nombre...');
    await search.fill(teammate.name);
    // El botón del resultado lleva la inicial del avatar delante del nombre
    await dialog.getByRole('button', { name: new RegExp(`${teammate.name}$`) }).click();
    await dialog.getByLabel(`Rol de ${teammate.name}`).fill('Backend');

    await dialog.getByRole('button', { name: 'publicarProyecto();' }).click();
    await expect(page.getByText('Proyecto publicado')).toBeVisible();
    await expect(dialog).toBeHidden();

    const saved = await db.project.findFirstOrThrow({
      where: { authorId: author.id },
      include: { members: true },
    });
    expect(saved).toMatchObject({
      title,
      isOpenSource: true,
      repoUrl: 'https://github.com/example/e2e-pro',
      startYear: 2023,
      endYear: 2025,
      techStack: ['E2eStack', 'Postgres'],
    });
    expect(saved.members).toEqual([
      expect.objectContaining({ userId: teammate.id, memberName: teammate.name, role: 'Backend' }),
    ]);

    // Aparece con el filtro open-source, con años y equipo
    await page.getByRole('button', { name: /--open-source/ }).click();
    const card = projectCard(page, title);
    await expect(card).toBeVisible();
    await expect(card).toContainText('open-source');
    await expect(card).toContainText('2023 → 2025');
    await expect(card.getByRole('link', { name: teammate.name })).toBeVisible();
    await expect(
      card.getByRole('link', { name: `Ver el repositorio de ${title} en GitHub` }),
    ).toHaveAttribute('href', 'https://github.com/example/e2e-pro');
  });

  test('TC-PRO-002 Validaciones del proyecto', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    await signIn(page, author);
    await page.goto('/proyectos');

    await page.getByRole('button', { name: 'publicarProyecto();' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo proyecto' });
    await dialog.getByLabel('Nombre del proyecto').fill('Proyecto inválido');
    await dialog.getByLabel('Descripción').fill('Descripción suficientemente larga.');
    await dialog.getByLabel('URL del proyecto').fill('https://example.com');
    await dialog.getByLabel('Es open-source').check();
    await dialog.getByLabel('Repositorio en GitHub').fill('https://gitlab.com/a/b');
    await dialog.getByLabel('Año de inicio').fill('2024');
    await dialog.getByLabel('Año de cierre').fill('2020');
    await dialog.getByRole('button', { name: 'publicarProyecto();' }).click();

    await expect(
      dialog.getByText(
        'Ingresá la URL de un repositorio de GitHub (https://github.com/usuario/repo)',
      ),
    ).toBeVisible();
    await expect(
      dialog.getByText('El año de cierre no puede ser anterior al de inicio'),
    ).toBeVisible();

    const maxYear = new Date().getFullYear() + 1;
    await dialog.getByLabel('Año de inicio').fill('1960');
    await dialog.getByRole('button', { name: 'publicarProyecto();' }).click();
    await expect(dialog.getByText(`Ingresá un año entre 1970 y ${maxYear}`)).toBeVisible();

    expect(await db.project.count({ where: { authorId: author.id } })).toBe(0);
  });

  test('los campos obligatorios vacíos muestran sus errores', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    await signIn(page, author);
    await page.goto('/proyectos');

    await page.getByRole('button', { name: 'publicarProyecto();' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo proyecto' });
    await dialog.getByRole('button', { name: 'publicarProyecto();' }).click();
    await expect(dialog.getByText('El título debe tener al menos 3 caracteres')).toBeVisible();
    await expect(
      dialog.getByText('La descripción debe tener al menos 10 caracteres'),
    ).toBeVisible();
    await expect(dialog.getByText('La URL del proyecto no es válida')).toBeVisible();

    await dialog.getByRole('button', { name: 'cancelar();' }).click();
    await expect(dialog).toBeHidden();
    expect(await db.project.count({ where: { authorId: author.id } })).toBe(0);
  });

  test('TC-PRO-003 Permisos de colaboradores', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    const collaborator = await createUser(db, 'e2e-pro');
    const title = `Proyecto compartido ${uniqueId('e2e-pro')}`;
    const project = await createProject(db, {
      title,
      authorId: author.id,
      members: [
        { userId: collaborator.id, memberName: collaborator.name, role: 'Frontend' },
        { userId: null, memberName: 'Persona sin cuenta', role: 'Diseño' },
      ],
    });

    await signIn(page, collaborator);
    await page.goto('/proyectos');

    // El colaborador edita y sale, pero no elimina
    await openActions(page, title);
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Salir del proyecto' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Eliminar' })).toHaveCount(0);
    await page.getByRole('menuitem', { name: 'Editar' }).click();

    const dialog = page.getByRole('dialog', { name: 'Editar proyecto' });
    // El equipo es de solo lectura para un colaborador
    await expect(
      dialog.getByText('Solo el autor puede cambiar el equipo y los roles.'),
    ).toBeVisible();
    await expect(dialog.getByPlaceholder('Buscar compañeros por nombre...')).toHaveCount(0);
    await expect(dialog.getByLabel('Rol del autor')).toHaveCount(0);

    const description = 'Descripción editada por un colaborador del proyecto.';
    await dialog.getByLabel('Descripción').fill(description);
    await dialog.getByRole('button', { name: 'actualizarProyecto();' }).click();
    await expect(page.getByText('Proyecto actualizado')).toBeVisible();
    await expect(projectCard(page, title)).toContainText(description);

    const afterEdit = await db.project.findUniqueOrThrow({
      where: { id: project.id },
      include: { members: { orderBy: { memberName: 'asc' } } },
    });
    expect(afterEdit.description).toBe(description);
    expect(afterEdit.members.map(({ memberName, role }) => ({ memberName, role }))).toEqual([
      { memberName: 'Persona sin cuenta', role: 'Diseño' },
      { memberName: collaborator.name, role: 'Frontend' },
    ]);

    await openActions(page, title);
    await page.getByRole('menuitem', { name: 'Salir del proyecto' }).click();
    const confirm = page.getByRole('alertdialog', { name: '¿Salir del proyecto?' });
    await confirm.getByRole('button', { name: 'Salir' }).click();
    await expect(page.getByText('Saliste del proyecto')).toBeVisible();

    await expect(
      projectCard(page, title).getByRole('button', { name: `Acciones de ${title}` }),
    ).toHaveCount(0);
    expect(
      await db.projectMember.count({ where: { projectId: project.id, userId: collaborator.id } }),
    ).toBe(0);
    expect(await db.projectMember.count({ where: { projectId: project.id } })).toBe(1);
  });

  test('el autor elimina su proyecto confirmando el diálogo', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    const title = `Proyecto a eliminar ${uniqueId('e2e-pro')}`;
    const project = await createProject(db, { title, authorId: author.id });
    await signIn(page, author);
    await page.goto('/proyectos');

    await openActions(page, title);
    await expect(page.getByRole('menuitem', { name: 'Salir del proyecto' })).toHaveCount(0);
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();
    const confirm = page.getByRole('alertdialog', { name: '¿Eliminar proyecto?' });
    await expect(confirm).toContainText(title);

    // Cancelar no borra nada
    await confirm.getByRole('button', { name: 'Cancelar' }).click();
    await expect(projectCard(page, title)).toBeVisible();

    await openActions(page, title);
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();
    await confirm.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Proyecto eliminado')).toBeVisible();
    await expect(projectCard(page, title)).toHaveCount(0);
    expect(await db.project.findUnique({ where: { id: project.id } })).toBeNull();
  });

  test('el autor cambia el equipo y los roles', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    const title = `Proyecto con equipo ${uniqueId('e2e-pro')}`;
    const project = await createProject(db, {
      title,
      authorId: author.id,
      members: [{ userId: null, memberName: 'Persona que se va', role: 'QA' }],
    });
    await signIn(page, author);
    await page.goto('/proyectos');

    await openActions(page, title);
    await page.getByRole('menuitem', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar proyecto' });
    await dialog.getByRole('button', { name: 'Quitar a Persona que se va' }).click();
    await dialog.getByPlaceholder('Buscar compañeros por nombre...').fill('Invitada Externa');
    await dialog
      .getByRole('button', { name: 'Agregar "Invitada Externa" (no tiene cuenta en PCN)' })
      .click();
    await expect(dialog.getByText('(sin cuenta)')).toBeVisible();
    await dialog.getByLabel('Rol del autor').fill('Líder');
    await dialog.getByRole('button', { name: 'actualizarProyecto();' }).click();
    await expect(page.getByText('Proyecto actualizado')).toBeVisible();

    await expect
      .poll(async () =>
        (await db.projectMember.findMany({ where: { projectId: project.id } })).map(
          (member) => member.memberName,
        ),
      )
      .toEqual(['Invitada Externa']);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).authorRole).toBe(
      'Líder',
    );
  });

  test('una persona ajena no ve las acciones del proyecto de otro', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-pro');
    const stranger = await createUser(db, 'e2e-pro');
    const title = `Proyecto ajeno ${uniqueId('e2e-pro')}`;
    await createProject(db, { title, authorId: author.id });
    await signIn(page, stranger);
    await page.goto('/proyectos');

    await expect(projectCard(page, title)).toBeVisible();
    await expect(
      projectCard(page, title).getByRole('button', { name: `Acciones de ${title}` }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ordenar();' })).toHaveCount(0);
  });
});

test.describe('como admin', () => {
  test.use({ as: 'admin' });

  test('TC-PRO-004 Reordenar proyectos con el teclado', async ({ page, db, browser }) => {
    const author = await createUser(db, 'e2e-pro');
    const first = await createProject(db, {
      title: `Proyecto orden A ${uniqueId('e2e-pro')}`,
      authorId: author.id,
    });
    const second = await createProject(db, {
      title: `Proyecto orden B ${uniqueId('e2e-pro')}`,
      authorId: author.id,
    });
    await expireCachedReads(browser, db);
    await page.goto('/proyectos');

    const headings = page.getByRole('article').getByRole('heading');
    const titles = async () => (await headings.allTextContents()).map((text) => text.trim());
    await expect.poll(async () => (await titles()).slice(-2)).toEqual([first.title, second.title]);

    await page.getByRole('button', { name: 'ordenar();' }).click();
    await expect(page.getByText(/arrastrá los proyectos/)).toBeVisible();
    // El último no puede bajar más
    await expect(page.getByRole('button', { name: `Bajar ${second.title}` })).toBeDisabled();
    await page.getByRole('button', { name: `Subir ${second.title}` }).click();
    await expect(page.getByText('Orden guardado')).toBeVisible();
    await page.getByRole('button', { name: 'terminar();' }).click();
    await expect(page.getByRole('button', { name: 'ordenar();' })).toBeVisible();

    await page.reload();
    await expect.poll(async () => (await titles()).slice(-2)).toEqual([second.title, first.title]);
    const [savedFirst, savedSecond] = await Promise.all([
      db.project.findUniqueOrThrow({ where: { id: first.id } }),
      db.project.findUniqueOrThrow({ where: { id: second.id } }),
    ]);
    expect(savedSecond.order).toBeLessThan(savedFirst.order);
  });

  test('un admin puede editar y eliminar el proyecto de otra persona', async ({
    page,
    db,
    browser,
  }) => {
    const author = await createUser(db, 'e2e-pro');
    const title = `Proyecto moderado ${uniqueId('e2e-pro')}`;
    const project = await createProject(db, { title, authorId: author.id });
    await expireCachedReads(browser, db);
    await page.goto('/proyectos');

    await openActions(page, title);
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();
    await page
      .getByRole('alertdialog', { name: '¿Eliminar proyecto?' })
      .getByRole('button', { name: 'Eliminar' })
      .click();
    await expect(page.getByText('Proyecto eliminado')).toBeVisible();
    expect(await db.project.findUnique({ where: { id: project.id } })).toBeNull();
  });
});

test.describe('sin sesión', () => {
  test('ve los proyectos sin acciones y publicar lo manda a iniciar sesión', async ({ page }) => {
    await page.goto('/proyectos');
    await expect(projectCard(page, PROJECT.title)).toBeVisible();
    await expect(page.getByRole('button', { name: 'publicarProyecto();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Acciones de / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ordenar();' })).toHaveCount(0);

    await page.getByRole('link', { name: 'iniciarSesion();' }).first().click();
    await expect(page).toHaveURL(/\/autenticacion\/iniciar-sesion/);
  });

  test('buscar filtra por título, stack o persona', async ({ page }) => {
    await page.goto('/proyectos');
    const search = page.getByRole('textbox', { name: 'Buscar proyectos' });

    await search.fill(PROJECT.title);
    await expect(projectCard(page, PROJECT.title)).toBeVisible();

    await search.fill('Playwright');
    await expect(projectCard(page, PROJECT.title)).toBeVisible();

    await search.fill('zzz-ningun-proyecto-e2e');
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByText(/grep: 0 proyectos/)).toBeVisible();
  });

  test('tocar una tecnología de la tarjeta filtra por ese stack', async ({ page }) => {
    await page.goto('/proyectos');
    const card = projectCard(page, PROJECT.title);
    await card.getByRole('button', { name: 'Playwright', exact: true }).click();
    await expect(card).toBeVisible();
    const articles = page.getByRole('article');
    const count = await articles.count();
    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toContainText('Playwright');
    }
    // Volver a tocarla saca el filtro
    await card.getByRole('button', { name: 'Playwright', exact: true }).click();
    await expect.poll(() => articles.count()).toBeGreaterThan(count);
  });

  test('el filtro open-source deja solo los proyectos abiertos', async ({ page }) => {
    await page.goto('/proyectos');
    const flag = page.getByRole('button', { name: /--open-source/ });
    await flag.click();
    await expect(flag).toHaveAttribute('aria-pressed', 'true');
    await expect(projectCard(page, PROJECT.title)).toBeVisible();
    const articles = page.getByRole('article');
    const count = await articles.count();
    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toContainText('open-source');
    }
  });
});
