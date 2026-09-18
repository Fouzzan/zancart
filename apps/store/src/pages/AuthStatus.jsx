import { Show, UserButton } from '@clerk/react'

function AuthStatus() {
  return (
    <Show when={'signed-in'}>
        <UserButton />
    </Show>
  )
}

export default AuthStatus