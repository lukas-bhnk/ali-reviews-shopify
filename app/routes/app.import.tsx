  import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
    Button,
  } from "@shopify/polaris";
  import { authenticate } from "../shopify.server";
  import { useEffect, useState } from "react";
  import { log } from "console";

  // In your route file (e.g., app/routes/products.tsx)
  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const first = 10;
    const after = null; // Modify this as per your pagination logic
    const variables = {
      first: first,
      after: after
    };
    console.log(request);
    
    const query = `
    query GetAllProducts($first: Int, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
    const response = await admin.graphql(
      query, { variables });
    console.log(response);
    
    if (response.ok) {
      const responseJson = await response.json();
      return responseJson.data.products;
    } else {
      throw new Error('Failed to fetch products');
    }
  };


/*   export const action = async ({ request }: ActionFunctionArgs) => {
    const queryString = `{
      products (first: 3) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`
    
    // `session` is built as part of the OAuth process
    const client = new shopify.clients.Graphql({session});
    const products = await client.query({
      data: queryString,
    }); */
    
/*     const { admin } = await authenticate.admin(request);
    const first = 10;
    const after = null; // Modify this as per your pagination logic
    const variables = {
      first: first,
      after: after
    };
    console.log(request);
    
    const query = `
    query GetAllProducts($first: Int, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
    const response = await admin.graphql(
      query, { variables });

    if (response.ok) {
      const responseJson = await response.json();
      return responseJson.data.products;
    } else {
      throw new Error('Failed to fetch products');
    }
  };
'*/
  const ProductsList = ({ products }) => {
    if (!products || products.length === 0) {
      return <Text as="p">No products found.</Text>; // Using Text component with 'as' prop
    }

    function onImport(id: any): void {
      throw new Error("Function not implemented.");
    }

    return (
      <>
        {products[0].edges.map(product => (
          <div key={product.node.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Listbox.Option value={product.node.id}>
            {product.node.title}
          </Listbox.Option>
          <button onClick={() => onImport(product.node.id)}>Import Reviews</button>
        </div>
        ))}
      </>
    );
  }; 

  export default function ProductsPage() {
    const [products, setProducts] = useState(useLoaderData());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
  
/*     const handleNext = async () => {
      // Calculate variables for the next page
      const { endCursor } = products.pageInfo;
      const variables = {
        first: itemsPerPage,
        after: endCursor,
      };
  
      const response = await fetchProducts(variables);
  
      if (response.ok) {
        const responseJson = await response.json();
        setProducts(responseJson.data.products);
        setCurrentPage(currentPage + 1);
      } else {
        console.error('Failed to fetch products');
      }
    };
  
    const handlePrevious = async () => {
      // Calculate variables for the previous page
      const { startCursor } = products.pageInfo;
      const variables = {
        last: itemsPerPage,
        before: startCursor,
      }; */
  
      /* const response = await fetchProducts(variables);
  
      if (response.ok) {
        const responseJson = await response.json();
        setProducts(responseJson.data.products);
        setCurrentPage(currentPage - 1);
      } else {
        console.error('Failed to fetch products');
      }
    };
  
    const fetchProducts = async (variables, request) => {
      const { admin } = await authenticate.admin(request);
      const query = `
        query GetAllProducts($first: Int, $last: Int, $after: String, $before: String) {
          products(first: $first, last: $last, after: $after, before: $before) {
            edges {
              node {
                id
                title
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
          */
      return (
        <Page>
          <ui-title-bar title="Import Reviews" />
    
          <Layout.Section>
            <Card>
              <div style={{color:'red', height: '50px'}}></div>
              <Listbox>
              <ProductsList products={products}/>
              </Listbox>

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
          label= {currentPage}
        />
      </div>
            </Card>
          </Layout.Section>
    
        </Page>)
    };
  
