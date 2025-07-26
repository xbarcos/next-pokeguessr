import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface DailyPokemonData {
  pokemon: any
  date: string
}

const DB_PATH = path.join(process.cwd(), "data", "daily-pokemon.json")

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function getDailyPokemonFromDB(): DailyPokemonData | null {
  try {
    ensureDataDir()
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading daily pokemon from DB:", error)
  }
  return null
}

function saveDailyPokemonToDB(data: DailyPokemonData) {
  try {
    ensureDataDir()
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error saving daily pokemon to DB:", error)
  }
}

function selectDailyPokemon(pokemonList: any[], date: string) {
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const index = Math.abs(hash) % pokemonList.length
  return pokemonList[index]
}

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const existingData = getDailyPokemonFromDB()
    if (existingData && existingData.date === today) {
      return NextResponse.json(existingData)
    }

    const pokemonDataPath = path.join(process.cwd(), "public", "pokemon-data.json")
    if (!fs.existsSync(pokemonDataPath)) {
      return NextResponse.json({ error: "Pokemon data not found" }, { status: 404 })
    }

    const pokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, "utf8"))
    const dailyPokemon = selectDailyPokemon(pokemonData, today)

    const newData: DailyPokemonData = {
      pokemon: dailyPokemon,
      date: today,
    }

    saveDailyPokemonToDB(newData)

    return NextResponse.json(newData)
  } catch (error) {
    console.error("Error in daily-pokemon API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
