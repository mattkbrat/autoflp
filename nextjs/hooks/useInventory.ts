import fetcher from "@/lib/fetcher"
import useSWR from "swr"

const useInventory = () => {
  const {data: inventory} = useSWR('/api/inventory', fetcher)

  return {inventory}
}

export default useInventory;
