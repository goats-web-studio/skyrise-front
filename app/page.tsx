import { HomeClient } from "@/components/home-client"
import { getBrands, getCertificates } from "@/lib/api"

export const revalidate = 60

export default async function Home() {
  const [brands, certificates] = await Promise.all([getBrands(), getCertificates()])

  return <HomeClient brands={brands} certificates={certificates} />
}
