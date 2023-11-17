import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  Listbox,
  Pagination,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";
import { request } from "http";



const ProductsList = ({ products }) => {
  if (!products || products.length === 0) {
    return <Text as="p">No products found.</Text>; // Using Text component with 'as' prop
  }

  return (
    <>
      {products.map(product => (
        <Listbox.Option key={product.id} value={product.id}>{product.title}</Listbox.Option>
      ))}
    </>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(`
      query GetAllProducts($first: Int, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              // ... other fields
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `, { first: itemsPerPage, after: pageInfo.endCursor });
    
    const responseJson = await response.json();
    setProducts(responseJson.data.products.edges.map((edge: { node: any; }) => edge.node));
    setPageInfo({
      hasNextPage: responseJson.data.products.pageInfo.hasNextPage,
      endCursor: responseJson.data.products.pageInfo.endCursor,
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
    return (
      <Page>
        <ui-title-bar title="Import Reviews" />
  
        <Layout.Section>
          <Card>
            <div style={{color:'red', height: '50px'}}></div>
            <Listbox>
            <ProductsList products={products} />
            </Listbox>
          <Pagination
            hasPrevious={currentPage > 1}
            onPrevious={handlePrevious}
            hasNext={true}
            onNext={handleNext}
          />
              <div
      style={{
        maxWidth: '700px',
        margin: 'auto',
        border: '1px solid var(--p-color-border)'
      }}
    >
      <Pagination
        onPrevious={() => {
          console.log('Previous');
        }}
        onNext={() => {
          console.log('Next');
        }}
        type="table"
        hasNext={true}
        label="1-50 of 8,450 orders"
      />
    </div>
          </Card>
        </Layout.Section>
  
      </Page>)
  };

