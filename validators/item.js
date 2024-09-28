const yup = require("yup");

const createItemSchema = yup.object().shape({
  id: yup.string().length(10).required(),
  name: yup.string().max(20).required(),
  description: yup.string().max(200).optional(),
  price: yup
    .number()
    .typeError("El precio debe ser numérico")
    .positive("El precio debe ser positivo")
    .required("El precio es requerido")
    .transform((value) => {
      if (value === undefined) return undefined;
      return Math.round(value * 100) / 100;
    }),
  model: yup.string().max(10).optional(),
});

const updateItemSchema = yup.object().shape({
  description: yup.string().max(200).optional(),
  model: yup.string().max(10).optional(),
});

module.exports = { createItemSchema, updateItemSchema };
