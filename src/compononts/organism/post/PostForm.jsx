import { FlexBox } from '../../../styled';
import { HiPhotograph } from "react-icons/hi";
import imageCompression from "browser-image-compression";
import React, { useEffect, useRef, useState } from 'react'
import { usePostPostsRTKMutation } from '../../../redux/api/api';
import { PhotoBtn, PostBtn, PostInput, PostWrite } from '../../css';

export function PostForm() {
  const postRef = useRef(null);
  const [postText, setPostText] = useState("");
  const [postImge, setpostImg] = useState("");
  const [showImg, setShowImg] = useState([]);
  const [postImgRTK] = usePostPostsRTKMutation();
  
  // Textarea에 대한 동적 Height 조절 핸들러
  const onChangeHeight = (e) => {
    setPostText(e.target.value);
    postRef.current.style.height = "auto";
    postRef.current.style.height = `${postRef.current.scrollHeight}px`;
  };

  // 이미지 리사이징에 대한 핸들러
  const actionImgResize = async (files) => {
    const options = {
      maxSizeMB: 1, // 1000000b === 1000kb === 1mb //
      maxWidthOrHeight: 3000,
      useWebWorker: true,
    };
    try {
      const compressBlob = await imageCompression(files, options);
      const compressFile = new File([compressBlob], files.name, {
        type: files.type,
      });
      return compressFile;
    } catch (e) {
      console.log(e.message);
    }
  };

  // 이미지 업로드에 대한 핸들러(미리보기 및, 리사이징 처리 )
  const onUploadFiles = async (e) => {
    setShowImg([])
    for (let i = 0; i < e.target.files.length; i++) {
      let file = e.target.files[i];
      let reader = new FileReader();
      reader.onload = () => {
        setShowImg((showImg) => [...showImg, reader.result]);
      };
      reader.readAsDataURL(file);
    }
    const compressingImg = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const compressed = await actionImgResize(e.target.files[i]);
      compressingImg.push(compressed);
    }
    setpostImg(compressingImg);
  };

  // 생성된 Post에 대한 제출 핸들러
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!postText) return 
    const formData = new FormData();
    formData.append("content-data", new Blob([JSON.stringify({content: postText})], {type:'application/json'}));
    for (let i = 0; i < postImge.length; i++) {
      formData.append("images-data", postImge[i]);
    }
    postImgRTK(formData);
    setShowImg([])
    setpostImg("")
    setPostText("")
  };

  // 사이드이팩트 : Post에 Focus() 이벤트
  useEffect(() => {
    postRef.current && postRef.current.focus();
  }, []);  


  return (
    <PostWrite
        as="form"
        $fd="column"
        $jc="space-between"
        $mTop={30}
        $borderR={20}
        $border={true}
        $gap=".5em"
        onSubmit={onSubmitHandler}
      >
        <PostInput ref={postRef} type="text" value={postText} placeholder="오늘의 대나무숲 이야기는?" onChange={onChangeHeight} />
        
        <FlexBox $jc="flex-start" $ai="start" $gap="3.3%" style={{ width: "100%", flexWrap: "wrap" }}>
          {showImg && showImg.map((img, inx) => ( <img key={inx} src={img} style={{display:"block", marginBottom:"10px"}}  width="22.5%" alt="previewImg" /> ))}
        </FlexBox>

        <PhotoBtn>
          <label htmlFor="postFile">
            {
              <>
                <HiPhotograph size={"1.5em"} />
                <p>이미지 첨부하기</p>
              </>
            }
          </label>

          <input
            id="postFile"
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={onUploadFiles}
          />
        </PhotoBtn>
        <FlexBox $jc="space-between" $type="mobilePost">
          <p>모든 사람이 답글을 달 수 있습니다. </p>
          <PostBtn
            disabled={!postText}
            onClick={onSubmitHandler}
            $postText={postText}
            children="post"
          />
        </FlexBox>
      </PostWrite>
  )
}