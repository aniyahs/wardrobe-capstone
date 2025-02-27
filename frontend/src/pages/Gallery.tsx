import React from "react";
import { View, Image, FlatList, ScrollView, Dimensions } from "react-native";
import { globalStyles } from "../styles/styles";

const images = [
  "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/285445/big-collar-shirts-285445-1581368086628-square-1200-80.jpg",
  "https://cdn01.pinkoi.com/product/bTeswVJr/0/1/640x530.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJEI47nE_NPeFITydr8cCp0v1iLGHUwrmXjg&s",
  "https://images.asos-media.com/products/asos-design-skinny-poplin-shirt-with-square-collar-in-brown/206529655-1-brown?$n_640w$&wid=513&fit=constrain",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCFRuvCE2fQENdON4uLkaa0T26XOloxe_tTw&s",
  "https://cdn11.bigcommerce.com/s-x7bzlb8042/images/stencil/2560w/products/8382/22135/ladies-banded-collar-shirt-306__69624.1641601660.jpg?c=1",
  "https://www.paulfredrick.com/cdn/shop/files/TabCollar_969ee738-fca7-42c8-8146-6beec8e89706.webp?v=1720187406&width=1024",
  "https://i.etsystatic.com/42063793/r/il/e83332/4758186778/il_fullxfull.4758186778_jgr0.jpg",
  "https://vercini.com/cdn/shop/files/red-shirt-with-black-squares-7_0000_Layer0copy2.jpg?v=1709766258",
  "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/285445/big-collar-shirts-285445-1581368086628-square-1200-80.jpg",
  "https://cdn01.pinkoi.com/product/bTeswVJr/0/1/640x530.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJEI47nE_NPeFITydr8cCp0v1iLGHUwrmXjg&s",
  "https://images.asos-media.com/products/asos-design-skinny-poplin-shirt-with-square-collar-in-brown/206529655-1-brown?$n_640w$&wid=513&fit=constrain",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCFRuvCE2fQENdON4uLkaa0T26XOloxe_tTw&s",
  "https://cdn11.bigcommerce.com/s-x7bzlb8042/images/stencil/2560w/products/8382/22135/ladies-banded-collar-shirt-306__69624.1641601660.jpg?c=1",
  "https://www.paulfredrick.com/cdn/shop/files/TabCollar_969ee738-fca7-42c8-8146-6beec8e89706.webp?v=1720187406&width=1024",
  "https://i.etsystatic.com/42063793/r/il/e83332/4758186778/il_fullxfull.4758186778_jgr0.jpg",
  "https://vercini.com/cdn/shop/files/red-shirt-with-black-squares-7_0000_Layer0copy2.jpg?v=1709766258",
  "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/285445/big-collar-shirts-285445-1581368086628-square-1200-80.jpg",
  "https://cdn01.pinkoi.com/product/bTeswVJr/0/1/640x530.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJEI47nE_NPeFITydr8cCp0v1iLGHUwrmXjg&s",
  "https://images.asos-media.com/products/asos-design-skinny-poplin-shirt-with-square-collar-in-brown/206529655-1-brown?$n_640w$&wid=513&fit=constrain",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCFRuvCE2fQENdON4uLkaa0T26XOloxe_tTw&s",
  "https://cdn11.bigcommerce.com/s-x7bzlb8042/images/stencil/2560w/products/8382/22135/ladies-banded-collar-shirt-306__69624.1641601660.jpg?c=1",
  "https://www.paulfredrick.com/cdn/shop/files/TabCollar_969ee738-fca7-42c8-8146-6beec8e89706.webp?v=1720187406&width=1024",
  "https://i.etsystatic.com/42063793/r/il/e83332/4758186778/il_fullxfull.4758186778_jgr0.jpg",
  "https://vercini.com/cdn/shop/files/red-shirt-with-black-squares-7_0000_Layer0copy2.jpg?v=1709766258",
  "https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/285445/big-collar-shirts-285445-1581368086628-square-1200-80.jpg",
  "https://cdn01.pinkoi.com/product/bTeswVJr/0/1/640x530.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJEI47nE_NPeFITydr8cCp0v1iLGHUwrmXjg&s",
  "https://images.asos-media.com/products/asos-design-skinny-poplin-shirt-with-square-collar-in-brown/206529655-1-brown?$n_640w$&wid=513&fit=constrain",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCFRuvCE2fQENdON4uLkaa0T26XOloxe_tTw&s",
  "https://cdn11.bigcommerce.com/s-x7bzlb8042/images/stencil/2560w/products/8382/22135/ladies-banded-collar-shirt-306__69624.1641601660.jpg?c=1",
  "https://www.paulfredrick.com/cdn/shop/files/TabCollar_969ee738-fca7-42c8-8146-6beec8e89706.webp?v=1720187406&width=1024",
  "https://i.etsystatic.com/42063793/r/il/e83332/4758186778/il_fullxfull.4758186778_jgr0.jpg",
  "https://vercini.com/cdn/shop/files/red-shirt-with-black-squares-7_0000_Layer0copy2.jpg?v=1709766258"
];

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 10; // Subtracting margin for spacing

const Gallery = () => {
  return (
    <FlatList
      data={images}
      keyExtractor={(item, index) => index.toString()}
      numColumns={3} // Forces 3 images per row
      renderItem={({ item }) => (
        <View style={{ margin: 5, width: imageSize, height: imageSize }}>
          <Image source={{ uri: item }} style={globalStyles.image} />
        </View>
      )}
      contentContainerStyle={globalStyles.container}
      showsVerticalScrollIndicator={false} // Hide the vertical scroll indicator
    />
  );
};

export default Gallery;