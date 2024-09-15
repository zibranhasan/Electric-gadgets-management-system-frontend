import { Form, Input, Button, DatePicker, message } from "antd";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import axios from "axios";
import { useAddGadgetsMutation } from "@/redux/features/electricGadgetsManagement.Api";

export interface ElectricGadget {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  releaseDate: string;
  brand: string;
  modelNumber: string;
  category: string;
  operatingSystem?: string;
  connectivity?: string;
  powerSource?: string;
  features?: string;
  weight?: number;
}

interface FormData extends ElectricGadget {
  photo: File | null;
}

const CreateElectricGadgets = () => {
  const { handleSubmit, control } = useForm<FormData>();
  const [addGadgets] = useAddGadgetsMutation();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formDataToSend = new FormData();
    formDataToSend.append("image", data.photo || "");

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=963ca9297bc7cea248773301a33b8428",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const formattedData = {
        ...data,
        photo: response.data.data.display_url,
        connectivity: data.connectivity ? data.connectivity.split(", ") : [],
        features: data.features ? data.features.split(", ") : [],
      };

      // console.log("Formatted Data:", formattedData);
      await addGadgets(formattedData);
      message.success("Gadgets created successfully");
      navigate("/dashboard/manager/get-electric-gadgets-by-filtering");
    } catch (error) {
      message.error("Error creating gadget");
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item label="Name">
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Photo">
        <Controller
          name="photo"
          control={control}
          render={({ field }) => (
            <Dropzone
              onDrop={(acceptedFiles) => field.onChange(acceptedFiles[0])}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  style={{
                    border: "1px dashed #ccc",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              )}
            </Dropzone>
          )}
        />
      </Form.Item>

      <Form.Item label="Price">
        <Controller
          name="price"
          control={control}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </Form.Item>

      <Form.Item label="Quantity">
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </Form.Item>

      <Form.Item label="Release Date">
        <Controller
          name="releaseDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              onChange={(dateString) => field.onChange(dateString)}
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Brand">
        <Controller
          name="brand"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Model Number">
        <Controller
          name="modelNumber"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Category">
        <Controller
          name="category"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Operating System">
        <Controller
          name="operatingSystem"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Connectivity">
        <Controller
          name="connectivity"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Power Source">
        <Controller
          name="powerSource"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Features">
        <Controller
          name="features"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item label="Weight">
        <Controller
          name="weight"
          control={control}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};

export default CreateElectricGadgets;
