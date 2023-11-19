import {getPaginationVariables, Pagination} from '@shopify/hydrogen';
import {useLoaderData, Link} from '@remix-run/react';
import { log } from 'console';
import { Shopify} from '@shopify/shopify-api';

export async function loader({context, request}) {
  const client = new Shopify.clients.Graphql({session});
  const variables = getPaginationVariables(request, {
    pageBy: 4,
  });
  console.log(ALL_PRODUCTS_QUERY, variables);
  console.log(variables);
  
  const {products} = await context.storefront.query(ALL_PRODUCTS_QUERY, {
    variables,
  });

  return products;
}

export default function () {
  const {products} = useLoaderData();

  return (
    <Pagination connection={products}>
      {({nodes, NextLink, PreviousLink, isLoading}) => (
        <>
          <PreviousLink>
            {isLoading ? 'Loading...' : 'Load previous products'}
          </PreviousLink>
          {nodes.map((product) => (
            <Link key={product.id} /* to={product.id} */>
              {product.title}
            </Link>
          ))}
          <NextLink>{isLoading ? 'Loading...' : 'Load next products'}</NextLink>
        </>
      )}
    </Pagination>
  );
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    publishedAt
    handle
    vendor
    variants(first: 1) {
      nodes {
        id
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          handle
          title
        }
      }
    }
  }
`;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
