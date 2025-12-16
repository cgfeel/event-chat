import './App.css';
import PubMox from './PubMox';
import SubMox from './SubMox';

const App = () => {
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <div>
        <span>
          <SubMox />
        </span>
      </div>
      <hr />
      <p>
        <span>
          <span>
            <PubMox />
          </span>
        </span>
      </p>
    </div>
  );
};

export default App;
