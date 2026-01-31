'use client'

import { supabase } from "@/supabase-client"
import { useEffect, useState } from "react";
import ChatroomCard from "@/components/ChatroomCard";

interface Chatroom{
    id: number;
    name: string;
    created_at: string;
}

export default function ChatRooms(){

    const [chatroom, setChatroom] = useState<Chatroom[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() =>{
        const fetchChatrooms = async ()=>{
            const {data, error} = await supabase
            .from('chatroom')
            .select('*')
            .order('created_at', {ascending: false})

            if(error) {
                console.error('Error fetching chatrooms:', error)
            }else{
                setChatroom(data || [])
            }
            setLoading(false)
        }
        fetchChatrooms()
    }, [])

    if (loading) return <p>Loading forums...</p>
    return(
        <div className="chatrooms-container">
            {chatroom.length > 0 ? (
                chatroom.map((chatroom) =>(
                    <ChatroomCard key={chatroom.id} chatroom={chatroom}/>
                ))
            ): (
                <p>No chatrooms yet... Set up a chat with someone or soemthign</p>
            )

            }
        </div>
    )
}

