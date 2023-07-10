"use client"

import { useState } from "react"
import Image from "next/image"

function FileUploadMultiple() {
    const [file, setFile] = useState()
    const [downLink, setDownLink] = useState(null)
    const [qr, setQr] = useState(null)

    const handleFileChange = (e) => {
        setDownLink(null)
        setFile(e.target.files[0])
    }

    const handleUploadClick = async () => {
        if (!file) {
            return
        }

        // 👇 Create new FormData object and append files
        const data = new FormData()
        data.append("file", file)

        // 👇 Uploading the files using the fetch API to the server
        fetch("https://store1.gofile.io/uploadFile", {
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
            <input type="file" onChange={handleFileChange} />

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
