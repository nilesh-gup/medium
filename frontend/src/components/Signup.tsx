import { Link, useNavigate } from 'react-router-dom'
import '../index.css'
import { useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../config'

export default function Signup() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [showWarning, setShowWarning] = useState(false)

    const navigate = useNavigate()

    const signupRequest = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
                username,
                email,
                name,
                password
            })
            localStorage.setItem('loggedInToken', response.data.token)
            navigate('/dashboard')
        } catch(e: any) {
            console.log("Some Error Occurred")
            if(e.response.status === 409) {
                setShowWarning(true)
                return
            }
            navigate('/error')
        }
    }

    return (
        <div className='h-screen bg-gray-400 flex'>
            <div className="bg-white h-max w-[25%] m-auto rounded-lg p-4">
                <div className='flex flex-col items-center'>
                    <p className='text-3xl font-bold pb-2'>Sign Up</p>
                    <p className='text-md text-gray-600 w-[80%] text-center'>Enter your information to create an account</p>
                </div>

                <TitleAndInput
                    onChange={(e) => {setUsername(e.target.value)}} 
                    title={'Username *'}
                    placeholder={'john-doe'}/>
                
                <TitleAndInput 
                    onChange={(e) => {setEmail(e.target.value)}} 
                    title={'Email *'}
                    showWarning={showWarning}
                    warningText='Username or email not available' 
                    placeholder={'john-doe@hmail.com'}/>

                <TitleAndInput onChange={(e) => {setName(e.target.value)}} title={'Full Name'} placeholder={'John Doe'}/>

                <TitleAndInput 
                    onChange={(e) => {setPassword(e.target.value)}} 
                    title={'Password *'} 
                    showWarning={password !== '' && password.length < 8}
                    warningText='Password must be atleast 8 characters' />

                <div className='bg-black text-white h-[40px] flex justify-center items-center rounded-lg mt-2 ml-1 mr-1 cursor-pointer'
                     onClick={signupRequest}>
                    Sign Up
                </div>
                <div className='flex justify-center p-2'>
                    <p className='font-normal'>Already have an account? <Link to='/signin' className='underline'> Login </Link></p>
                </div>
            </div>
        </div>
    )
}

interface TitleAndInputProps {
    title: string
    placeholder?: string
    showWarning?: boolean
    warningText?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function TitleAndInput({ title, placeholder, showWarning=false, warningText='', onChange } : TitleAndInputProps) {
    return (
        <div className='pt-6 pb-1 pl-1 pr-1'>
            <p className='font-semibold pb-2'>{title}</p>
            <input 
                className='border-gray border-2 rounded w-full h-10 p-2 placeholder:text-gray-500' 
                onChange={onChange} 
                placeholder={placeholder} />
            {showWarning && <p className='text-sm p-1 text-red-500'>{warningText}</p>}
        </div>
    )
}