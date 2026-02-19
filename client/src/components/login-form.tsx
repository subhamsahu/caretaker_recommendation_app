import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginUser, registerUser, clearError } from "@/store/slices/authSlice"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result
      if (isRegister) {
        result = await dispatch(registerUser({ email, username, password }))
        if (registerUser.fulfilled.match(result)) {
          navigate("/profiles")
        }
      } else {
        result = await dispatch(loginUser({ email, password }))
        if (loginUser.fulfilled.match(result)) {
          navigate("/profiles")
        }
      }
    } catch (err) {
      console.error("Auth failed:", err)
    }
  }

  const handleInputChange = () => {
    if (error) dispatch(clearError())
  }

  const toggleMode = () => {
    setIsRegister((prev) => !prev)
    dispatch(clearError())
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isRegister ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isRegister
              ? "Sign up to start managing recommendations for your kids"
              : "Sign in to KidCare Recommendations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      handleInputChange()
                    }}
                    required
                  />
                </div>

                {isRegister && (
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Your name"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        handleInputChange()
                      }}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      handleInputChange()
                    }}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? isRegister
                      ? "Creating account..."
                      : "Signing in..."
                    : isRegister
                      ? "Sign Up"
                      : "Sign In"}
                </Button>
              </div>

              <div className="text-center text-sm">
                {isRegister ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {isRegister ? "Sign in" : "Sign up"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
