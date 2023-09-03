"use client"

import { useEffect, useRef, useState } from "react"
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

function Home() {
    const [files, setFiles] = useState([])
    const [downLink, setDownLink] = useState(null)
    const [qrimage, setQrimage] = useState(null)
    const [bestserver, setBestserver] = useState("store1")
    const [server, setServer] = useState("store1")
    const [isUploading, setIsUploading] = useState(false)
    const fileInput = useRef()

    async function updateServer() {
        fetch("https://api.gofile.io/getServer")
            .then((data) => data.json())
            .then((res) => {
                if (res.data.server) setBestserver(res.data.server)
            })
    }

    useEffect(() => {
        const serverUpdater = setInterval(async () => {
            updateServer()
        }, 30 * 1000)

        updateServer()

        return () => {
            clearInterval(serverUpdater)
        }
    }, [])

    const handleClear = () => {
        setFiles([])
        setDownLink(null)
        setQrimage(null)
        fileInput.current.value = ""
    }

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

        setServer(bestserver)
        setIsUploading(true)
        fetch(`https://${bestserver}.gofile.io/uploadFile`, {
            method: "POST",
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "ok") {
                    const link = data?.data?.downloadPage
                    if (link) {
                        setDownLink(link)
                        handleGetQr(link)
                    }
                }
            })
            .catch((error) => console.error(error))
            .finally(() => {
                setIsUploading(false)
            })
    }

    const handleGetQr = (url) => {
        setQrimage(null)
        fetch(
            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`
        )
            .then((res) => res.blob())
            .then((blob) => URL.createObjectURL(blob))
            .then((imgurl) => {
                setQrimage(imgurl)
            })
            .catch((e) => {
                console.error(e)
            })
    }

    return (
        <div className="flex justify-center items-center flex-col gap-y-4">
            <input
                ref={fileInput}
                type="file"
                multiple
                disabled={downLink}
                onChange={handleFileChange}
            />

            {!downLink && files.length ? (
                <button
                    className="w-32 block border-red-50 border-2 m-5 px-5 py-2 rounded-full bg-green-600 hover:bg-green-400"
                    onClick={handleUploadClick}
                >
                    Upload
                </button>
            ) : (
                !downLink && (
                    <button className="w-32 cursor-default block border-red-50 border-2 m-5 px-5 py-2 rounded-full bg-green-600 opacity-60">
                        Upload
                    </button>
                )
            )}

            {isUploading && <p className="animate-pulse">Uploading....</p>}

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

            {qrimage && (
                <div>
                    <Image
                        src={qrimage}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: "100%", height: "auto" }}
                        alt={downLink}
                    />
                </div>
            )}

            {downLink && (
                <button
                    className="block w-32 border-red-50 border-2 m-5 px-5 py-2 rounded-full bg-yellow-600 hover:bg-yellow-400"
                    onClick={handleClear}
                >
                    Clear
                </button>
            )}
        </div>
    )
}

export default Home
