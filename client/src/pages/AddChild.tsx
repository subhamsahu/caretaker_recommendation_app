/**
 * Create child profile form — ShadCN UI style.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createChild } from "@/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const INTEREST_OPTIONS = ["science", "art", "sports", "coding"]

export default function AddChild() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [age, setAge] = useState(8)
  const [interests, setInterests] = useState<string[]>([])
  const [screenTime, setScreenTime] = useState(60)
  const [error, setError] = useState("")

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (interests.length === 0) {
      setError("Please select at least one interest.")
      return
    }
    try {
      await createChild({ name, age, interests, screen_time_limit: screenTime })
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create child profile")
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Add Child Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Emma"
              />
            </div>

            {/* Age */}
            <div className="grid gap-2">
              <Label>Age ({age})</Label>
              <input
                type="range"
                min={6}
                max={15}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6</span>
                <span>15</span>
              </div>
            </div>

            {/* Interests */}
            <div className="grid gap-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <Badge
                    key={opt}
                    variant={interests.includes(opt) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-4"
                    onClick={() => toggleInterest(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Screen Time */}
            <div className="grid gap-2">
              <Label>Daily Screen Time Limit — {screenTime} min</Label>
              <input
                type="range"
                min={10}
                max={240}
                step={10}
                value={screenTime}
                onChange={(e) => setScreenTime(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 min</span>
                <span>240 min</span>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
