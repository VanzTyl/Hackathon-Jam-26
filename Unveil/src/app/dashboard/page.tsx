import AuthGuard from '@/components/AuthGuard'

function Dashboard(){
  return(
    <AuthGuard>
      <p>meow</p>
    </AuthGuard>
    
  )
}

export default Dashboard