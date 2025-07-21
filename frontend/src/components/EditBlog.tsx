import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BACKEND_URL } from '../config'

export default function EditBlog() {
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

    const onSave = async () => {
        try {
            const token = localStorage.getItem('loggedInToken')
            if(token == null) {
                navigate('/signin')
            }
            await axios.put(`${BACKEND_URL}/api/v1/blog`, {
                title,
                content,
                blogId
            }, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
            navigate('/dashboard')
        } catch(e: any) {
            console.log('Some error occurred')
            navigate('/dashboard')
        }
    }

    return (
        <div>
            <div className='flex justify-center border-2 p-4 bg-gray-200'>
                <p className='text-5xl font-bold font-serif'>Medium</p>
            </div>

            <textarea
                className='border-2 text-5xl font-serif p-4 m-2 border-dashed w-[98%]'
                minLength={1}
                defaultValue={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />
            
            <textarea
                className='border-2 text-xl font-serif p-4 m-2 w-[98%] h-60'
                minLength={1}
                defaultValue={content}
                onChange={(e) => {
                    setContent(e.target.value)
                }}
            />

            <div className='flex grid-cols-2 justify-end'>
                <div className='flex mt-4 mr-8'>
                    <p
                        className='bg-green-500 h-10 w-32 rounded-xl flex justify-center items-center cursor-pointer'
                        onClick={onSave}>
                        Save
                    </p>
                </div>

                <div className='flex mt-4 mr-8'>
                    <p
                        className='bg-green-500 h-10 w-32 rounded-xl flex justify-center items-center cursor-pointer'
                        onClick={() => {
                            navigate('/dashboard')
                        }}>
                        Cancel
                    </p>
                </div>
            </div>

        </div>
    )
}