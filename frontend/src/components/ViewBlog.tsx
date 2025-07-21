import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BACKEND_URL } from '../config'

export default function ViewBlog() {
    const [searchParams] = useSearchParams()
    const blogId = searchParams.get('blogId')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem("loggedInToken")
                if(token == null) {
                    navigate('/signin')
                }
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${blogId}`, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
                setTitle(response.data.blog.title)
                setContent(response.data.blog.content)
            } catch(e) {
                console.log("Error: " + e)
            }
        }
        fetchBlog()
    }, [])

    return (
        <div>
            <div className='flex justify-center border-2 p-4 bg-gray-200'>
                <p className='text-5xl font-bold font-serif'>Medium</p>
            </div>
            <p className='border-2 text-5xl font-serif p-4 m-2 border-dashed'>{title}</p>
            <p className='border-2 text-xl p-4 m-2'>{content}</p>
            <div className='flex justify-end mt-4 mr-8'>
                <p
                    className='bg-green-500 h-10 w-44 rounded-xl flex justify-center items-center cursor-pointer'
                    onClick={() => {
                        navigate('/dashboard')
                    }}>
                    Back To Dashboard
                </p>
            </div>
        </div>
    )
}