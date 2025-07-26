import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchAllPokemon() {
  console.log("Fetching all Pokémon data...")

  try {
    // First, get the list of all Pokémon
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    const data = await response.json()

    const pokemonList = []

    // Fetch detailed data for each Pokémon
    for (let i = 0; i < data.results.length; i++) {
      const pokemon = data.results[i]
      console.log(`Fetching ${pokemon.name} (${i + 1}/${data.results.length})`)

      try {
        const detailResponse = await fetch(pokemon.url)
        const detail = await detailResponse.json()

        // Get species data for generation info
        const speciesResponse = await fetch(detail.species.url)
        const species = await speciesResponse.json()

        const pokemonData = {
          id: detail.id,
          name: detail.name,
          height: detail.height / 10, // Convert to meters
          weight: detail.weight / 10, // Convert to kg
          types: detail.types.map((type) => type.type.name),
          generation: Number.parseInt(species.generation.url.split("/").slice(-2, -1)[0]),
          sprite: detail.sprites.other?.["official-artwork"]?.front_default || detail.sprites.front_default,
        }

        pokemonList.push(pokemonData)

        // Small delay to be respectful to the API
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Error fetching ${pokemon.name}:`, error)
      }
    }

    // Ensure public directory exists
    const publicDir = path.join(__dirname, "..", "public")
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Save to public directory
    const outputPath = path.join(publicDir, "pokemon-data.json")
    fs.writeFileSync(outputPath, JSON.stringify(pokemonList, null, 2))

    console.log(`Successfully fetched ${pokemonList.length} Pokémon and saved to ${outputPath}`)
  } catch (error) {
    console.error("Error fetching Pokémon data:", error)
  }
}

fetchAllPokemon()
