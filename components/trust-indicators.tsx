import Image from "next/image"

export function TrustIndicators() {
  const partners = [
    { name: "TechCrunch", logo: "https://img.icons8.com/?size=100&id=110580&format=png&color=000000" },
    { name: "Forbes", logo: "https://img.icons8.com/?size=100&id=GZN6GkqKKaUW&format=png&color=000000" },
    { name: "CNN", logo: "https://img.icons8.com/?size=100&id=77185&format=png&color=000000" },
    { name: "BBC", logo: "https://img.icons8.com/?size=100&id=118555&format=png&color=000000" },
    { name: "Reuters", logo: "https://img.icons8.com/?size=100&id=hFoVFpm6gl9A&format=png&color=000000" },
    { name: "WSJ", logo: "https://img.icons8.com/?size=100&id=64156&format=png&color=000000" },
  ]

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gray-600 font-medium">Trusted and featured by leading media outlets</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-80 transition-opacity duration-300">
          {partners.map((partner, index) => (
            <div key={index} className="flex justify-center">
              <Image
                src={partner.logo || "https://img.icons8.com/?size=100&id=110580&format=png&color=000000"}
                alt={partner.name}
                width={120}
                height={40}
                className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
