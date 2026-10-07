import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DateInput, parseDateValue, toDateValue } from './date-input';

jest.setTimeout(20_000);

const Controlled = ({
  initial = '',
  onChange = jest.fn(),
  ...props
}: Partial<React.ComponentProps<typeof DateInput>> & { initial?: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <DateInput
      aria-label="Fecha"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      {...props}
    />
  );
};

describe('parseDateValue', () => {
  it('reads native-input values, with T or a space before the time', () => {
    expect(parseDateValue('2026-09-07')).toEqual({ date: '2026-09-07', time: null });
    expect(parseDateValue('2026-09-07T19:30')).toEqual({ date: '2026-09-07', time: '19:30' });
    expect(parseDateValue('2026-09-07 19:30:15')).toEqual({ date: '2026-09-07', time: '19:30' });
    expect(parseDateValue('7/9/2026')).toEqual({ date: null, time: null });
    expect(parseDateValue(null)).toEqual({ date: null, time: null });
  });
});

describe('DateInput', () => {
  it('picks a day from the calendar and closes', async () => {
    const onChange = jest.fn();
    render(<Controlled initial="2026-09-07" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));
    expect(screen.getByRole('grid', { name: 'sep 2026' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: /lunes 7 de septiembre/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(screen.getByRole('gridcell', { name: /viernes 18 de septiembre/ }));

    expect(onChange).toHaveBeenLastCalledWith('2026-09-18');
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-09-18');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('moves between months and jumps through the month view', async () => {
    render(<Controlled initial="2026-01-31" />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));

    await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('grid', { name: 'feb 2026' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Elegir mes y año' }));
    await userEvent.click(screen.getByRole('button', { name: 'Año anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'jun' }));
    expect(screen.getByRole('grid', { name: 'jun 2025' })).toBeInTheDocument();
  });

  it('walks the days with the keyboard', async () => {
    const onChange = jest.fn();
    render(<Controlled initial="2026-09-30" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));
    screen.getByRole('gridcell', { name: / 30 de septiembre/ }).focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('grid', { name: 'oct 2026' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: / 1 de octubre/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('2026-10-01');
  });

  it('greys out days outside min and max', async () => {
    const onChange = jest.fn();
    render(
      <Controlled initial="2026-09-10" min="2026-09-05" max="2026-09-20" onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));

    const early = screen.getByRole('gridcell', { name: / 4 de septiembre/ });
    expect(early).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(early);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('picks a time and keeps it when the day changes', async () => {
    const onChange = jest.fn();
    render(<Controlled withTime initial="2026-09-07T19:30" onChange={onChange} />);
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-09-07 19:30');

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario y la hora' }));
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'hh' })).getByRole('option', { name: '21' }),
    );
    expect(onChange).toHaveBeenLastCalledWith('2026-09-07T21:30');
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'mm' })).getByRole('option', { name: '05' }),
    );
    expect(onChange).toHaveBeenLastCalledWith('2026-09-07T21:05');
    await userEvent.click(screen.getByRole('gridcell', { name: / 8 de septiembre/ }));
    expect(onChange).toHaveBeenLastCalledWith('2026-09-08T21:05');
    // Picking a day doesn't close it when there's a time to choose too.
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('takes typed dates once they are complete and real', () => {
    const onChange = jest.fn();
    render(<Controlled onChange={onChange} />);
    const field = screen.getByLabelText('Fecha');

    fireEvent.change(field, { target: { value: '2026-02-3' } });
    fireEvent.change(field, { target: { value: '2026-02-31' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(field, { target: { value: '2026-02-28' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-02-28');
  });

  it('jumps to today and clears unless required', async () => {
    const onChange = jest.fn();
    const { unmount } = render(<Controlled initial="2020-01-01" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));
    await userEvent.click(screen.getByRole('button', { name: '[hoy]' }));
    expect(onChange).toHaveBeenLastCalledWith(toDateValue(new Date()));

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));
    await userEvent.click(screen.getByRole('button', { name: /limpiar/ }));
    expect(onChange).toHaveBeenLastCalledWith('');
    unmount();

    render(<Controlled required initial="2020-01-01" />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir el calendario' }));
    expect(screen.queryByRole('button', { name: /limpiar/ })).not.toBeInTheDocument();
  });
});
