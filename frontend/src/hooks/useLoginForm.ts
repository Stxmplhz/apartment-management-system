import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function useLoginForm() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        try {
            setIsLoading(true)
            await login(email, password)
            toast.success('Login successful!')
            navigate('/')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed'
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        email, setEmail,
        password, setPassword,
        isLoading, error,
        handleSubmit
    }
}