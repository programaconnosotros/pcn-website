export const UnorderedList = ({ items }: { items: string[] }) => (
  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);
