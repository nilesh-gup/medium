import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

interface User {
    id: string
    username: string
    email: string
    name?: string
    password: string
    createdAt: string
}

interface Author {
    id: string
    username: string
}

interface OtherBlog {
    id: string
    title: string
    content: string
    published: boolean
    author: Author
}

interface MyBlog {
    id: string
    title: string
    content: string
    published: boolean
    createdAt: string
}

export default function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState<User | null>()
    const [otherBlogs, setOtherBlogs] = useState<OtherBlog[]>()
    const [myBlogs, setMyBlogs] = useState<MyBlog[]>()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("loggedInToken")
                const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
                setLoggedInUser(response.data.user)
            } catch(e) {
                navigate('/signin')
            }
        }

        fetchCurrentUser()

        const fetchOtherBlogs = async () => {
            try {
                const token = localStorage.getItem("loggedInToken")
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/otherblogs`, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
                setOtherBlogs(response.data.blogs)
            } catch(e) {
                console.log("Error: " + e)
            }
        }
        fetchOtherBlogs()

        const fetchMyBlogs = async () => {
            try {
                const token = localStorage.getItem("loggedInToken")
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/myblogs`, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
                setMyBlogs(response.data.blogs)
            } catch(e) {
                console.log("Error: " + e)
            }
        }
        fetchMyBlogs()
    }, [])

    return (
        <div>
            <TopNavBar loggedInUser={loggedInUser} />
            <div className='grid grid-cols-2 m-4'>

                <div className='border-4 border-r-2 border-black p-4 col-span-1'>
                    <p className='text-4xl mb-4 p-2 text-green-700 font-semibold'>Start Reading Now</p>
                    {otherBlogs?.map((otherBlog: OtherBlog)=> <RenderOtherBlogs otherBlog={otherBlog} />)}
                </div>

                <div className='border-4 border-l-2 border-black p-4 col-span-1'>
                    <div className='flex justify-between mb-4 p-2'>
                        <p className='text-4xl text-green-700 font-semibold'>My Blogs</p>
                        <p 
                            className='bg-blue-500 h-10 w-48 text-xl rounded-xl flex justify-center items-center cursor-pointer font-bold'
                            onClick={() => {
                                navigate('/newblog')
                            }}>
                            New Blog
                        </p>
                    </div>
                    {myBlogs?.map((myBlog: MyBlog)=> <RenderMyBlogs myBlog={myBlog} />)}
                </div>
            </div>
        </div>
    )
}

interface TopNavBarProps {
    loggedInUser?: User | null   
}

function TopNavBar({ loggedInUser }: TopNavBarProps) {
    const navigate = useNavigate()
    const logout = () => {
        localStorage.removeItem('loggedInToken')
        navigate('/signin')
    }

    return (
        <div className='flex justify-between border-2 p-4 bg-gray-200'>
            <p className='text-5xl font-bold font-serif'>Medium</p>
            <div className='flex grid-cols-2 gap-8'>
                <div className='flex items-center'>
                    <p className='text-3xl'>Hello, {loggedInUser?.username}</p>
                    <p className='bg-green-500 p-4 font-semibold rounded-full ml-4 mr-2 w-14 h-14 flex justify-center items-center text-2xl'>{loggedInUser?.username[0]?.toUpperCase()}</p>
                </div>
                <div 
                    className='bg-black text-white h-[40px] w-20 flex justify-center items-center rounded-lg mt-2 ml-1 mr-1 cursor-pointer'
                    onClick={logout}>
                        Logout
                </div>
            </div>
        </div>
    )
}

interface RenderOtherBlogsProps {
    otherBlog: OtherBlog
}

function RenderOtherBlogs({ otherBlog }: RenderOtherBlogsProps) {
    const navigate = useNavigate()

    let title: string = otherBlog?.title
    if(title.length > 30) {
        title = title.substring(0, 30) + '...'
    }

    let content: string = otherBlog?.content
    if(content.length > 100) {
        content = content.substring(0, 100) + '...'
    }
    
    return (
        <div className='border-2 p-4 mb-4 rounded-lg'>
            <div className='flex justify-between p-2'>
                <p className='text-2xl font-bold'>{title}</p>
                <p 
                    className='bg-green-500 h-10 w-36 rounded-xl flex justify-center items-center cursor-pointer'
                    onClick={() => {
                        navigate(`/viewblog?blogId=${otherBlog?.id}`)
                    }}>
                    Start Reading
                </p>
            </div>
            <p className='text-base pl-2 w-[75%]'>{content}</p>
            <p className='flex justify-end pr-4 text-lg'>By {otherBlog?.author?.username}</p>
        </div>
    )
}

interface MyBlogsProps {
    myBlog: MyBlog
}

function RenderMyBlogs({ myBlog }: MyBlogsProps) {
    const navigate = useNavigate()

    let title: string = myBlog?.title
    if(title.length > 30) {
        title = title.substring(0, 30) + '...'
    }

    let content: string = myBlog?.content
    if(content.length > 100) {
        content = content.substring(0, 100) + '...'
    }

    return (
        <div className='border-2 p-4 mb-4 rounded-lg'>
        <div className='flex justify-between p-2'>
            <p className='text-2xl font-bold'>{title}</p>
            <div className='flex grid-cols-2 gap-4'>
                <p 
                    className='bg-green-500 h-10 w-16 rounded-xl flex justify-center items-center col-span-1 cursor-pointer'
                    onClick={() => {
                        navigate(`/viewblog?blogId=${myBlog?.id}`)
                    }}>
                    View
                </p>
                <p 
                    className='bg-green-500 h-10 w-16 rounded-xl flex justify-center items-center col-span-1 cursor-pointer'
                    onClick={() => {
                        navigate(`/editblog?blogId=${myBlog?.id}`)
                    }}>
                    Edit
                </p>
            </div>
        </div>
        <p className='text-base pl-2 w-[75%]'>{content}</p>
    </div>
    )
}