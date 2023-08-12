const ReceiptPage = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return <p>Receipt {params.id}</p>;
};
