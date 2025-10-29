import parse from "html-react-parser";

const ShowPost = ({ htmlContent }) => {
  return (
    <div className='tiptap mt-2  bg-white p-4 max-h-40 overflow-y-scroll'>
      <div>{parse(htmlContent)}</div>
    </div>
  );
};

export default ShowPost;
