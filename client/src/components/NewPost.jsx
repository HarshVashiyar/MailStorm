import { useState } from "react";
import Tiptap from "./TipTap";
// import ShowPost from "./ShowPost";

const NewPost = ({ setHtml }) => {
  const [htmlContent, setHtmlContent] = useState("");

  const handleEditorContentSave = (html) => {
    setHtmlContent(html);
    setHtml(html);
  };

  return (
    <>
      <Tiptap onEditorContentSave={handleEditorContentSave} />
      <hr/>
      {/* <ShowPost htmlContent={htmlContent} /> */}
    </>
  );
};

export default NewPost;
