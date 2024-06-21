import { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [ProductDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "laptops",
    new_price: "",
    old_price: ""
  });

  const imageHandler = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setProductDetails({ ...ProductDetails, image: file });
  }

  const changeHandler = (e) => {
    setProductDetails({ ...ProductDetails, [e.target.name]: e.target.value });
  }

  const Add_Product = async () => {
    console.log(ProductDetails);

    let responseData;
    let product = ProductDetails;

    let formData = new FormData();
    formData.append('product', image);

    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    }).then((resp) => resp.json()).then((data) => { responseData = data });

    if (responseData.success) {
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product),
      }).then((resp) => resp.json()).then((data) => {
        data.success ? alert("Product Added") : alert("Failed")
      })
    }
  }

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input value={ProductDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type Here' />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input value={ProductDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type Here' />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input value={ProductDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type Here' />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={ProductDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
          <option value="laptops">Laptops</option>
          <option value="phones">Phones</option>
          <option value="televisions">Televisions</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-thumbnail-img' alt="Upload Area" />
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
      </div>
      <button onClick={Add_Product} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct;
