const DealPage = ({
  params,
}: {
  params: {
    id: string | string[];
  };
}) => {
  console.log({ params });

  return <p>Deal</p>;
};

export default DealPage;
