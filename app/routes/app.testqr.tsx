import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
  Button,
  BlockStack,
} from "@shopify/polaris";



import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { log } from "console";
import { useState } from "react";
import ModalWithPrimaryActionExample from "~/components/modal_import";

// [START loader]
export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const first = 10;
  const after = null; // Modify this as per your pagination logic
  const variables = {
    first: first,
    after: after
  };
  
  const query = `
  query GetAllProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            images(first: 1) {
              edges {
                node {
                  url
                  src
                }
              }
            }
          }
        }
      }
    }
`;
const response = await admin.graphql(
query, { variables });
const responseJson = await response.json();
return json( {products: responseJson.data.products.edges});
}
// [END loader]

// [START empty]
const EmptyProductsState = () => (
  <EmptyState
    heading="There is no product in your Shop"
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Allow customers to scan codes and buy products using their phones.</p>
  </EmptyState>
);
// [END empty]


function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

// [START table]
const ProductsTable = ({ products }) => (
  <IndexTable
    resourceName={{
      singular: "Product Review",
      plural: "Product Reviews",
    }}
    itemCount={products.products.length}
    headings={[
      { title: "Thumbnail", hidden: true },
      { title: "Product" },
      { title: "Import Reviews"}
    ]}
    selectable={false}
  >
    
    {products.products.map((product) => (
      <ProductTableRow key={product.node.id} product={product.node} />
    ))}
  </IndexTable>
);
// [END table]

// [START row]
const ProductTableRow = ({ product }) => (
  <IndexTable.Row id={product.id} position={product.id}>
    <IndexTable.Cell>
    <Thumbnail
        source={product?.images?.edges[0]?.node?.src || ImageMajor}
        alt={product.title}
        size="small"
      />
    </IndexTable.Cell>
{/*     <IndexTable.Cell>
      <Link to={`qrcodes/${qrCode.id}`}>{truncate(qrCode.title)}</Link>
    </IndexTable.Cell> */}
    <IndexTable.Cell>
      {/* [START deleted] */}
      {
        truncate(product.title)
      }
      {/* [END deleted] */}
    </IndexTable.Cell>
{/*     <IndexTable.Cell>
      <Link to={`qrcodes/${qrCode.id}`}>{truncate(qrCode.title)}</Link>
    </IndexTable.Cell> */}
    <IndexTable.Cell>
      {/* [START deleted] */}
      {
        <ModalWithPrimaryActionExample title={product.title} id={product.id} src={product?.images?.edges[0]?.node?.src || ImageMajor}/>
      }
      {/* [END deleted] */}
    </IndexTable.Cell>
  </IndexTable.Row>
);
// [END row]

export default function Index() {
  const [products, setProducts] = useState(useLoaderData());
  
  
    // [START select-product]
    async function selectProduct() {
    const products_new = await window.shopify.resourcePicker({
        type: "product",
        action: "select", 
        filter: {
            variants: false
        }
        // customized action verb, either 'select' or 'add',
    });
    

    if (products_new) {
        const { images, id, title } = products_new[0]
          
        setProducts({
                products: [ 
                    {node: {
                        id: id,
                        title: title,
                        images: {
                            edges: [{
                                node: {
                                    src: images[0]?.originalSrc
                                }}
                            ]
                        }
                    }}]
        });
        
}}
  
  const navigate = useNavigate();

  // [START page]
  return (
    <Page>
      <ui-title-bar title="Import Reviews">
        <button variant="primary" onClick={() => navigate("/app/qrcodes/new")}>
          Import Reviews
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
        
        <Card>
                  <BlockStack gap="200">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                  </BlockStack>
        </Card>
          <Card padding="0">
            {products?.length === 0 ? (
              <EmptyProductsState/>
            ) : (
              <ProductsTable products={products} />
            )}
            
          </Card>
          
        </Layout.Section>
      </Layout>
    </Page>
  );
  // [END page]
}
