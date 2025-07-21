import { Link, useNavigate } from 'react-router-dom'
import '../index.css'
import { useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../config'

export default function Signin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showWarning, setShowWarning] = useState(false)

    const navigate = useNavigate()
    
    const onSignInClick = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
                email,
                password
            })
            localStorage.setItem('loggedInToken', response.data.token)
            navigate('/dashboard')
        } catch(e: any) {
            console.log('Some error occurred')
            if(e.response.status === 401) {
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
                    <p className='text-3xl font-bold pb-2'>Sign In</p>
                    <p className='text-md text-gray-600 w-[80%] text-center'>Enter your credentials to access your account</p>
                </div>

                <TitleAndInput onChange={(e) => {setEmail(e.target.value)}} title={'Email'} placeholder={'john-doe@hmail.com'}/>
                <TitleAndInput title={'Password'}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    showWarning={showWarning}
                    warningText='Email or password incorrect' />

                <div 
                    className='bg-black text-white h-[40px] flex justify-center items-center rounded-lg mt-2 ml-1 mr-1 cursor-pointer'
                    onClick={onSignInClick}>
                        Sign In
                </div>

                <div className='flex justify-center p-2'>
                    <p className='font-normal'>Don't have an account? <Link to='/signup' className='underline'> Sign Up </Link></p>
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

function TitleAndInput({title, placeholder, showWarning=false, warningText='', onChange}: TitleAndInputProps) {
    return (
        <div className='pt-6 pb-1 pl-1 pr-1'>
            <p className='font-semibold pb-2'>{title}</p>
            <input 
                className='border-gray border-2 rounded w-full h-10 p-2 placeholder:text-gray-500' 
                placeholder={placeholder} 
                onChange={onChange} />
            {showWarning && <p className='text-sm p-1 text-red-500'>{warningText}</p>}
        </div>
    )
}