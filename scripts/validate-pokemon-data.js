import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function validatePokemonData() {
  const filePath = path.join(__dirname, "..", "public", "pokemon-data.json")

  console.log("Checking pokemon-data.json...")

  if (!fs.existsSync(filePath)) {
    console.log("❌ File does not exist")
    return false
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf8")
    console.log(`📄 File size: ${fileContent.length} characters`)

    if (fileContent.trim().length === 0) {
      console.log("❌ File is empty")
      return false
    }

    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      console.log("❌ Data is not an array")
      return false
    }

    console.log(`✅ Valid JSON with ${data.length} Pokémon`)

    // Check first few entries
    if (data.length > 0) {
      console.log("📋 First Pokémon:", data[0])

      // Validate structure
      const requiredFields = ["id", "name", "height", "weight", "types", "generation"]
      const firstPokemon = data[0]

      for (const field of requiredFields) {
        if (!(field in firstPokemon)) {
          console.log(`❌ Missing field: ${field}`)
          return false
        }
      }

      console.log("✅ Structure looks good")
    }

    return true
  } catch (error) {
    console.log("❌ JSON parsing error:", error.message)
    try {
      const fileContent = fs.readFileSync(filePath, "utf8")
      console.log("📄 First 200 characters of file:")
      console.log(fileContent.substring(0, 200))
    } catch (readError) {
      console.log("❌ Cannot read file:", readError.message)
    }

    return false
  }
}

// Run validation
const isValid = validatePokemonData()

if (!isValid) {
  console.log("\n🔧 To fix this issue:")
  console.log("1. Delete the current pokemon-data.json file")
  console.log("2. Run 'npm run fetch-pokemon' again")
  console.log("3. Make sure the script completes without interruption")
}
