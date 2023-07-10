"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import JSZip from "jszip"

const create_zip_file = async (files) => {
    const zip = new JSZip()
    Array.from(files, (f) => {
        zip.file(f.name, f)
    })

    const zip_file = await zip.generateAsync({ type: "blob" })
    return zip_file
}

function FileUploadMultiple() {
    const [files, setFiles] = useState([])
    const [downLink, setDownLink] = useState(null)
    const [qr, setQr] = useState(null)
    const [server, setServer] = useState("store1")

    useEffect(() => {
        const serverUpdater = setInterval(async () => {
            const data = await fetch("https://api.gofile.io/getServer")
            const res = await data.json()
            if (res.data.server) setServer(res.data.server)
        }, 30 * 1000)

        return () => {
            clearInterval(serverUpdater)
        }
    }, [])

    const handleFileChange = (e) => {
        setDownLink(null)
        setFiles(e.target.files)
    }

    const handleUploadClick = async () => {
        if (!files) {
            return
        }

        const data = new FormData()

        if (files.length == 1) {
            data.append("file", files[0])
        } else {
            data.append("file", await create_zip_file(files), "files.zip")
        }

        // 👇 Uploading the files using the fetch API to the server
        fetch(`https://${server}.gofile.io/uploadFile`, {
            method: "POST",
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "ok") {
                    console.log(data.data)
                    const { downloadPage } = data.data
                    setDownLink(downloadPage)
                    handleGetQr(downloadPage)
                }
            })
            .catch((error) => console.error(error))
    }

    const handleGetQr = (url = "Example") => {
        setQr(null)
        fetch(
            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`
        )
            .then((res) => res.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((imgurl) => {
                setQr(imgurl)
            })
            .catch((e) => {
                console.error(e)
            })
    }

    return (
        <div className="flex justify-center items-center flex-col">
            <input type="file" multiple onChange={handleFileChange} />

            <button
                className="block border-red-50 border-2 m-5 px-5 py-2 rounded-full bg-slate-700"
                onClick={handleUploadClick}
            >
                Upload
            </button>

            {downLink && (
                <div>
                    <a
                        target="_blank"
                        href={downLink}
                        className="text-yellow-300"
                    >
                        File Download Link
                    </a>
                </div>
            )}

            {qr && (
                <div className="m-10">
                    <Image src={qr} width={250} height={250} alt={downLink} />
                </div>
            )}
        </div>
    )
}

export default FileUploadMultiple
