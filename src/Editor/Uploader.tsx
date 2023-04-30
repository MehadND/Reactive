import { faAngleRight, faRemove, faSmile, faSmileWink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { FileDrop } from 'react-file-drop'
import './uploader.css';
import { generateVideoThumbnails } from '@rajesh896/video-thumbnails-generator';
import { Shimmer } from 'react-shimmer';

type Props = {
    sourceURLs: Array<string>,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
    videoThumbnails: Array<{ thumbnail: string, name: string, type: string } | null>,
    setVideoThumbnails: (setSourceUrls: Array<{ thumbnail: string, name: string, type: string } | null>) => void,
    removeVideo: (index: number) => void,
    setShowEditor: (setShowEditor: boolean) => void,
}

export default function ({ sourceURLs, setSourceUrls, videoThumbnails, setVideoThumbnails, removeVideo, setShowEditor }: Props) {
    const fileinputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.addEventListener('drop', function (e) {
            e.preventDefault()
            e.stopPropagation()
        })
    }, []);

    const uploadVideo = async (files: (FileList | null)) => {
        const allFiles = Array.from(files ?? []);

        const thumbnails: Array<{ thumbnail: string, name: string, type: string } | null> = Array(allFiles.length).fill(null);
        const toUpload: Array<string> = allFiles.map((v, i) => {
            const url: string = URL.createObjectURL(v)

            return url;
        })
        setSourceUrls([...sourceURLs, ...toUpload]);
        setVideoThumbnails([...videoThumbnails, ...thumbnails]);

        for (let i = 0; i < allFiles.length; i++) {
            const thumbnailArray = await generateVideoThumbnails(allFiles[i], 1, 'jpeg');
            thumbnails[i] = { thumbnail: thumbnailArray[1] ?? thumbnailArray[0], name: allFiles[i]?.name ?? `Video ${i + 1}`, type: allFiles[i]?.type };
        }
        setVideoThumbnails([...videoThumbnails, ...thumbnails]);
    }

    return (
        <div className="uploader-preview-box">
            <div className={'uploader-container'}>
                <input
                    onChange={(e) => uploadVideo(e.target.files)}
                    type='file'
                    className='hidden'
                    ref={fileinputRef}
                    multiple={true}
                    accept='video/*'
                />

                <FileDrop
                    onDrop={uploadVideo}
                    onTargetClick={() => fileinputRef?.current?.click()}
                >
                    <div>
                        Click or drop your videos here to edit!
                    </div>

                    {(sourceURLs?.length > 0) && (
                        (sourceURLs?.length >= 5) ?
                            <div style={{ fontWeight: 'normal', marginTop: '0.5rem' }}>You can only add upto 5 videos <FontAwesomeIcon icon={faSmile} style={{ color: 'rgb(255, 204, 0)' }} /></div>
                            :
                            <div style={{ fontWeight: 'normal', marginTop: '0.5rem' }}>Don't shy. You can add upto 5 videos at a time <FontAwesomeIcon icon={faSmileWink} style={{ color: 'rgb(255, 204, 0)' }} /></div>
                    )}
                </FileDrop>
            </div>

            {(videoThumbnails?.length > 0) && (
                <div className="preview-container">
                    {videoThumbnails.map((metadata, index) => (
                        <div style={{ position: 'relative' }}>
                            <FontAwesomeIcon icon={faRemove} className="remove-icon" onClick={() => removeVideo(index)} />
                            {(metadata?.thumbnail !== null && metadata?.thumbnail !== undefined) ? (
                                <img src={metadata?.thumbnail} className="preview-image" />
                            )
                                :
                                <div>
                                    <Shimmer width={120} height={120} className='preview-image' />
                                </div>
                            }

                            {(metadata?.name !== null && metadata?.name !== undefined) ? (
                                <div style={{ fontSize: 'small', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 100, textAlign: 'center', marginTop: '0.5rem' }}>
                                    {metadata?.name}
                                </div>
                            )
                                :
                                <Shimmer width={120} height={10} className='video-placeholder' />
                            }
                        </div>
                    ))}
                </div>
            )}

            {(sourceURLs?.length > 0) && (
                <button className="start-editing-button" onClick={() => setShowEditor(true)}>
                    <div>
                        Start Editing
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </div>
                </button>
            )}
        </div>
    )
}