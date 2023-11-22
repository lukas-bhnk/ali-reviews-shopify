import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server"
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
  Modal,
  FormLayout,
  TextField,
} from "@shopify/polaris";



import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
import { log } from "console";
import { useCallback, useState } from "react";    
import { scrapeReviews } from "~/webscraper/ali-scraper";

// [START loader]
export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const first = 10;
  const after = null; // Modify this as per your pagination logic
  const variables = {
    first: first,
    after: after
  };
    // If reviewsArray is an array of review objects
    const testResult = await db.review.create({
      data: {
        content: "Test review",
        productId: "TestProductId",
        stars: 9
      }
  });
  
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

export async function action({request}) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData())
  };

  try {
    // Assuming scrapeReviews returns a Promise
    const reviewsArray = await scrapeReviews();
    console.log("Reviews: ", reviewsArray);

    // If reviewsArray is an array of review objects
    const results = await Promise.all(reviewsArray.map(async (rev) => {
        return await db.review.create({
            data: {
                content: rev['Reviews'],
                productId: data.productId,
                stars: rev['StarRating']
            }
        });
    }));

    console.log("Database operation results: ", results);

} catch (error) {
    console.error("Error in creating reviews or test review:", error);
} finally {
    console.log("Could not import Review");
}
return null
};

  
 // const testing =  await db.review.create({ data })



export default function Index() {
  const [products, setProducts] = useState(useLoaderData());
  const navigate = useNavigate();

  // States related to the modal
  //const toggleModal = useCallback(() => setActive((active) => !active), []);
  const handleUrlChange = (value) => setProductUrl(value);
  const handleStoreNumberChange = (value) => setStoreNumber(value);
  const [active, setActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productUrl, setProductUrl] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const submit = useSubmit()

  // Handler for opening the modal
  const handleOpenModal = (product: React.SetStateAction<null>) => {
    setSelectedProduct(product);
    setActive(true);
  };

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
  


  // Handler for form submission
  const handleSubmit = async () => {
    const data = {
      title: "test",
      productId: "testzw34",
      stars: 5
    };
    submit(data, { method: "post" });
    setActive(false)
  };

  // The modal component
  const ModalWithPrimaryActionExample = ({ src, title, productId }) => (
    <Modal
      activator={<Button onClick={() => handleOpenModal({ title, productId, src })}>Import Reviews</Button>}
      open={active}
      onClose={() => setActive(false)}
      title="Enter Details"
      primaryAction={{
          content: 'Submit',
          onAction: handleSubmit,
      }}
      secondaryActions={[{
          content: 'Cancel',
          onAction: () => setActive(false),
      }]}
    >
      <Modal.Section>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                <div style={{ marginRight: '16px' }}>
                  <Thumbnail
                    source={src}
                    alt={title}
                    size="small"
                  />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {title}
                </div>
              </div>
        <FormLayout>
          <TextField
            value={productUrl}
            onChange={handleUrlChange}
            label="Product URL"
            type="url"
            autoComplete="off"
          />
          <TextField
            value={storeNumber}
            onChange={handleStoreNumberChange}
            label="Store Number"
            type="text"
            autoComplete="off"
          />
        </FormLayout> 
      </Modal.Section>
    </Modal>

  );

  // A row in the products table
  const ProductTableRow = ({ product }) => (
    <IndexTable.Row id={product.id} position={product.id}>
      <IndexTable.Cell>
        <Thumbnail
          source={product?.images?.edges[0]?.node?.src || ImageMajor}
          alt={product.title}
          size="small"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        {truncate(product.title)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <ModalWithPrimaryActionExample title={product.title} productid={product.id} src={product?.images?.edges[0]?.node?.src || ImageMajor}/>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
  const EmptyProductsState = () => (
    <EmptyState
      heading="There is no product in your Shop"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Allow customers to scan codes and buy products using their phones.</p>
    </EmptyState>
  );
  // The products table component
  const ProductsTable = ({ products }) => (
    <IndexTable
      resourceName={{ singular: "Product", plural: "Products" }}
      itemCount={products.length}
      headings={[
        { title: "Thumbnail" },
        { title: "Product" },
        { title: "Import Reviews"}
      ]}
      selectable={false}
    >
      {products.map((product: { node: { id: React.Key | null | undefined; }; }) => (
        <ProductTableRow key={product.node.id} product={product.node} />
      ))}
    </IndexTable>
  );

  // Function to truncate text
  function truncate(str: string, { length = 25 } = {}) {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
  }

  return (
    <Page>
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
              <ProductsTable products={products.products} />
            )}
            
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}