'use client'

import { supabase } from "@/supabase-client"
import { useEffect, useState } from "react";
import ChatroomCard from "@/components/ChatroomCard";

interface Chatroom{
    // id: number;       
    chat_room_id: string;   // Changed the name and data type to match the column DB name
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
            // We rename the item to 'item' to avoid confusion with the array
                chatroom.map((item) =>(
                    <ChatroomCard key={item.chat_room_id} chatroom={item}/>
                ))
            ): (
                <p>No chatrooms yet... Set up a chat with someone or something</p>
            )

            }
        </div>
    )
}

