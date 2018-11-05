import React, { useState, Suspense } from 'react';
import { unstable_createResource as createResource } from "react-cache";
import axios from "axios";

const sleep = time => new Promise((resolve) =>
  setTimeout(resolve, time)
);

const PostsResource = createResource(async () => {
  let url = Math.random() > 0.5 ? "https://jsonplaceholder.typicode.com/posts" : "https://jsonplaceholder.typicode.com/bosts";
  const { data } = await axios.get(url);

  await sleep(3000);

  return data;
});

const PostResource = createResource(async id => {
  let requestId = Math.random() > 0.5 ? 300 : id;
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts/${requestId}`);

  await sleep(1500);
  return data;
});

function Post({ id, setPostId }) {
  const post = PostResource.read(id);

  return (
    <div>
      <button onClick={() => setPostId()}><span role="img" aria-label="back-arrow">👈</span>Back home</button>
        <Suspense maxDuration={1000} fallback={'Loading...'}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </Suspense>
    </div>
  )
}

function Posts({ setPostId }) {
  const posts = PostsResource.read();

  return (
    <div>
      <h2>Posts</h2>
      {posts.map(post => (
        <li key={post.id} onClick={() => setPostId(300)} style={{ cursor: 'pointer' }}>
          {post.title}
        </li>
      ))}
    </div>
  )
}

class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {

    return this.state.hasError ? this.props.fallback(this.state.error) : this.props.children;
  }
}

function App() {
  const [postId, setPostId] = useState(null);

  return (
    <div>
      <h1>Hello World!</h1>
      <ErrorBoundary fallback={error => <div style={{ color: "mediumpurple" }}>{error}</div>}>
        <Suspense fallback={'Loading...'} maxDuration={1000}>
          {postId ? (
            <ErrorBoundary fallback={error => <div style={{ color: "coral" }}>{error}</div>}>
              <Post id={postId} setPostId={setPostId} />
            </ErrorBoundary>
          ) : (
              <ErrorBoundary fallback={error => <div style={{ color: "turquoise" }}>{error}</div>}>
                <Posts setPostId={setPostId} />
              </ErrorBoundary>
            )}
        </Suspense>
      </ErrorBoundary>
    </div>
  )

}


export default App;
