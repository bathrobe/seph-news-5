import React from 'react'

export const metadata = {
  description: 'Public notes curated with Payload CMS.',
  title: 'Seph News',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="note-app">
        <main>{children}</main>
      </body>
    </html>
  )
}
