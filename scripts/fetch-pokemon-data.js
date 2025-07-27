import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchAllPokemon() {
  const LIMIT = 493;
  console.log("Buscando todos os pokémon...")

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}`)
    const data = await response.json()

    const pokemonList = []

    for (let i = 0; i < data.results.length; i++) {
      const pokemon = data.results[i]

      try {
        const detailResponse = await fetch(pokemon.url)
        const detail = await detailResponse.json()

        const speciesResponse = await fetch(detail.species.url)
        const species = await speciesResponse.json()

        const pokemonData = {
          id: detail.id,
          name: detail.name,
          height: detail.height,
          weight: detail.weight,
          types: detail.types.map((type) => type.type.name),
          generation: Number.parseInt(species.generation.url.split("/").slice(-2, -1)[0]),
          sprite: detail.sprites.other?.["official-artwork"]?.front_default || detail.sprites.front_default,
        }

        console.log(`Salvou ${pokemonData.name} #${pokemonData.id} com sucesso.`)

        pokemonList.push(pokemonData)
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Error fetching ${pokemon.name}:`, error)
      }
    }

    const publicDir = path.join(__dirname, "..", "public")
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    const outputPath = path.join(publicDir, "pokemon-data.json")
    fs.writeFileSync(outputPath, JSON.stringify(pokemonList, null, 2))

    console.log(`Successfully fetched ${pokemonList.length} Pokémon and saved to ${outputPath}`)
  } catch (error) {
    console.error("Error fetching Pokémon data:", error)
  }
}

fetchAllPokemon()
