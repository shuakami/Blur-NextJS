// utils/cropImage.ts
export interface Area {
    width: number
    height: number
    x: number
    y: number
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', error => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // 解决跨域问题
        image.src = url
    })

export default async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('无法获取Canvas上下文')

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                const reader = new FileReader()
                reader.readAsDataURL(blob)
                reader.onloadend = () => {
                    resolve(reader.result as string)
                }
            } else {
                reject(new Error('裁剪失败'))
            }
        }, 'image/png')
    })
}
