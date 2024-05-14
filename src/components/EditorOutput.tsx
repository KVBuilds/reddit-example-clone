"use client"

import dynamic from 'next/dynamic'
import CustomCodeRenderer from './renderers/CustomCodeRenderer'
import CustomImageRenderer from './renderers/CustomImageRenderer'
import { FC } from 'react'


const Output = dynamic(async () => (await import('editorjs-react-renderer')).default, {
    ssr: false
})

interface EditorOutputProps {
    content: any
}

const style = {
    paragraph: {
        fontSize: '0.874rem',
        lineHeight: '1.25rem',
    },
}

//Responsible for showing the preview and content
const renderers = {
    image: CustomImageRenderer,
    code: CustomCodeRenderer,
}

const EditorOutput: FC<EditorOutputProps> = ({}) => {
    return ( 
    // @ts-ignore
    <Output data={content} style={style} className='text-sm' renderers={renderers} />
)}

export default EditorOutput