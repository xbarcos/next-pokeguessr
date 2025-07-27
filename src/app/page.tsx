"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Trophy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PokemonCharacteristic } from "@/components/pokemon-characteristic"
import GenerationTipsBadge from "@/components/generation-tips-badge"
import { getGenerationName } from "./enums/generations"
import { Badge } from "@/components/ui/badge"

interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  types: string[]
  generation: number
  sprite: string
}

interface Guess {
  pokemon: Pokemon
  results: {
    generation: "correct" | "higher" | "lower"
    type1: "correct" | "wrong"
    type2: "correct" | "wrong"
    height: "correct" | "higher" | "lower"
    weight: "correct" | "higher" | "lower"
  }
}

interface GameState {
  guesses: Guess[]
  gameWon: boolean
  date: string
}

export default function MonkepoGame() {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([])
  const [dailyPokemon, setDailyPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<Pokemon[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [gameWon, setGameWon] = useState(false)
  const [showWinModal, setShowWinModal] = useState(false)
  const [currentDate, setCurrentDate] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const loadGameState = (date: string): GameState | null => {
    try {
      const saved = localStorage.getItem(`monkepo-game-${date}`)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Error loading game state:", error)
      return null
    }
  }

  const saveGameState = (gameState: GameState) => {
    try {
      localStorage.setItem(`monkepo-game-${gameState.date}`, JSON.stringify(gameState))
    } catch (error) {
      console.error("Error saving game state:", error)
    }
  }

  function getTodaySaoPaulo() {
    return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      .split("/").reverse().join("-");
  }

  const cleanupOldGameStates = () => {
    try {
      const todaySP = getTodaySaoPaulo();
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("monkepo-game-") && key !== `monkepo-game-${todaySP}`) {
          localStorage.removeItem(key)
          console.log(`🧹 Cleaned up old game state: ${key}`)
        }
      })
    } catch (error) {
      console.error("Error cleaning up old game states:", error)
    }
  }


  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🔄 Loading Pokémon data...")
        const pokemonResponse = await fetch("/pokemon-data.json")
        if (!pokemonResponse.ok) {
          throw new Error("Failed to load Pokémon data")
        }
        const pokemonList = await pokemonResponse.json()
        setPokemonData(pokemonList)

        console.log("🔄 Getting daily Pokémon...")
        const dailyResponse = await fetch("/api/daily-pokemon")
        if (!dailyResponse.ok) {
          throw new Error("Failed to get daily Pokémon")
        }
        const dailyData = await dailyResponse.json()
        setDailyPokemon(dailyData.pokemon)
        setCurrentDate(dailyData.date)

        cleanupOldGameStates()

        const savedState = loadGameState(dailyData.date)
        if (savedState) {
          console.log("📱 Restored game state from localStorage")
          setGuesses(savedState.guesses)
          setGameWon(savedState.gameWon)
        }

        console.log(`✅ Game initialized for ${dailyData.date}`)
        console.log(`🎯 Daily Pokémon: ${dailyData.pokemon.name}`)
      } catch (loadError) {
        console.error("❌ Error loading data:", loadError)
        setError(loadError instanceof Error ? loadError.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (currentDate && (guesses.length > 0 || gameWon)) {
      const gameState: GameState = {
        guesses,
        gameWon,
        date: currentDate,
      }
      saveGameState(gameState)
    }
  }, [guesses, gameWon, currentDate])

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = pokemonData
        .filter(
          (pokemon) =>
            pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
            !guesses.some((guess) => guess.pokemon.id === pokemon.id),
        )
        .slice(0, 8)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, pokemonData, guesses])

  const makeGuess = (pokemon: Pokemon) => {
    if (!dailyPokemon || gameWon) return

    const results = {
      generation:
        pokemon.generation === dailyPokemon.generation
          ? "correct"
          : pokemon.generation > dailyPokemon.generation
            ? "higher"
            : "lower",
      type1: pokemon.types[0] === dailyPokemon.types[0] ? "correct" : "wrong",
      type2:
        pokemon.types.length === 1 && dailyPokemon.types.length === 1
          ? "correct"
          : pokemon.types.length === 2 && dailyPokemon.types.length === 2
            ? pokemon.types[1] === dailyPokemon.types[1]
              ? "correct"
              : "wrong"
            : pokemon.types.length === dailyPokemon.types.length
              ? "correct"
              : "wrong",
      height:
        pokemon.height === dailyPokemon.height
          ? "correct"
          : pokemon.height > dailyPokemon.height
            ? "higher"
            : "lower",
      weight:
        pokemon.weight === dailyPokemon.weight
          ? "correct"
          : pokemon.weight > dailyPokemon.weight
            ? "higher"
            : "lower",
    } as Guess["results"]
    console.log(`Pokemon Height: ${pokemon.height}, Daily Pokemon Height: ${dailyPokemon.height}`)
    console.log(`Pokemon Weight: ${pokemon.weight}, Daily Pokemon Weight: ${dailyPokemon.weight}`)

    const newGuess: Guess = { pokemon, results }
    const newGuesses = [...guesses, newGuess]
    setGuesses(newGuesses)

    const won = Object.values(results).every((result) => result === "correct")
    if (won) {
      setGameWon(true)
      setShowWinModal(true)
    }

    setSearchTerm("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-300" />
          <p className="text-gray-300">Carregando Pokémon...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <Card className="max-w-md bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2 text-white">Erro</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedGuesses = [...guesses].reverse()

  return (
    <div className="">      
      <header className="max-w-4xl mx-auto px-4 flex items-center justify-center flex-col">                 
        <img
          src="/logo.png"
          alt="PokéGuessr Logo"
          className="h-28 w-28 ml-4 object-contain"
        />
        <GenerationTipsBadge />
      </header>
      
      <main className="max-w-4xl mx-auto px-4">
        <div className="text-center my-2">
          {gameWon && (
            <Badge className="bg-green-500 text-white font-medium text-xl">🎉 Parabéns! Volte amanhã para um novo desafio!</Badge>            
          )}
          {!gameWon && (
            <h2 className="text-2xl font-bold text-white mb-2">Adivinhe o Pokémon do Dia!</h2>
          )}
        </div>
        <p className="text-gray-300 text-center mt-4">Digite o nome de um Pokémon para fazer sua tentativa</p>
        
        <div className="relative mb-8 max-w-md mx-auto">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={gameWon ? "Jogo concluído! Volte amanhã..." : "Digite o nome do Pokémon..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-4 pr-10 text-lg rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600"
              disabled={gameWon}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          
          {showSuggestions && suggestions.length > 0 && !gameWon && (
            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 mt-1 max-h-64 overflow-y-auto">
              {suggestions.map((pokemon) => (
                <button
                  key={pokemon.id}
                  onClick={() => makeGuess(pokemon)}
                  className="cursor-pointer w-full px-4 py-3 text-left hover:bg-gray-600 border-b border-gray-600 last:border-b-0 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <div className="flex items-center">
                    <img
                      src={pokemon.sprite || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="w-10 h-10 mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
                      }}
                    />
                    <div>
                      <span className="font-medium text-white">{capitalizeFirst(pokemon.name)}</span>
                      <div className="text-xs text-gray-400">
                        {getGenerationName(pokemon.id)} • {pokemon.types.map(capitalizeFirst).join(", ")}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {showSuggestions && suggestions.length === 0 && searchTerm.length > 0 && !gameWon && (
            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 mt-1 p-4 text-center text-gray-400">
              Nenhum Pokémon encontrado com "{searchTerm}"
            </div>
          )}
        </div>


        {sortedGuesses.length > 0 && (
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold text-center text-white">
              Suas Tentativas ({sortedGuesses.length})
            </h3>

            {sortedGuesses.map((guess, index) => (
              <Card key={index} className="overflow-hidden bg-gray-800 border-gray-700 relative">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-center md:justify-around gap-4">
                    {Object.values(guess.results).every((r) => r === "correct") && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg text-xs font-bold z-10">
                        <Trophy className="h-4 w-4" />
                        Acertou!
                      </span>
                    )}
                    <div className="flex justify-center items-center space-x-4 w-full md:w-auto">
                      <img
                        src={guess.pokemon.sprite || "/placeholder.svg"}
                        alt={guess.pokemon.name}
                        className="w-16 h-16"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${guess.pokemon.id}.png`
                        }}
                      />
                      <div>
                        <h4 className="text-lg font-bold text-white">{capitalizeFirst(guess.pokemon.name)}</h4>
                        <p className="text-sm text-gray-400">#{guess.pokemon.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap md:flex-nowrap justify-center gap-2 md:space-x-4 w-full md:w-auto">
                      <PokemonCharacteristic
                        label="Gen"
                        value={guess.pokemon.generation}
                        result={guess.results.generation}
                      />
                      <PokemonCharacteristic
                        label="Tipo 1"
                        value={capitalizeFirst(guess.pokemon.types[0])}
                        result={guess.results.type1}
                      />
                      <PokemonCharacteristic
                        label="Tipo 2"
                        value={guess.pokemon.types[1] ? capitalizeFirst(guess.pokemon.types[1]) : "-"}
                        result={guess.results.type2}
                      />
                      <PokemonCharacteristic
                        label="Altura"
                        value={`${guess.pokemon.height / 10}m`}
                        result={guess.results.height}
                      />
                      <PokemonCharacteristic
                        label="Peso"
                        value={`${guess.pokemon.weight / 10}kg`}
                        result={guess.results.weight}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>      
      {showWinModal && dailyPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-green-400">Parabéns!</h2>
              <p className="mb-4 text-gray-300">Você adivinhou o Pokémon do dia!</p>

              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <img
                  src={dailyPokemon.sprite || "/placeholder.svg"}
                  alt={dailyPokemon.name}
                  className="w-24 h-24 mx-auto mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dailyPokemon.id}.png`
                  }}
                />
                <h3 className="text-xl font-bold text-white">{capitalizeFirst(dailyPokemon.name)}</h3>
                <div className="text-sm text-gray-300 mt-2">
                  <p>Geração: {dailyPokemon.generation}</p>
                  <p>Tipos: {dailyPokemon.types.map(capitalizeFirst).join(", ")}</p>
                  <p>
                    Altura: {dailyPokemon.height/10}m | Peso: {dailyPokemon.weight/10}kg
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4">
                Você acertou em {guesses.length} tentativa{guesses.length !== 1 ? "s" : ""}!
              </p>

              <p className="text-sm text-blue-400 mb-4">Volte amanhã para um novo desafio!</p>

              <Button onClick={() => setShowWinModal(false)} className="w-full bg-blue-600 hover:bg-blue-700">
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
