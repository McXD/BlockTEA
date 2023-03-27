import { Link } from "react-router-dom";

function IndexPage() {
  return (
    <div>
      <h1>Index </h1>
      <nav>
        <ul>
          <li>
            <Link to="/invoice/buyer">Buyer Invoice</Link>
          </li>
          <li>
            <Link to="/invoice/seller">Seller Invoice</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default IndexPage;