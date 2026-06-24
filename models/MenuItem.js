import mongoose from 'mongoose';

const customizationOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  additionalPrice: [{
    type: Number,
    default: 0
  }]
});

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    index: true // index for filtering speed
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  allergens: [{
    type: String
  }],
  customizationOptions: [customizationOptionSchema]
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
