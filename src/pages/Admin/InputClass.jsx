import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import Swal from "sweetalert2";
import { ListClass } from "../../components/ListItems";
import { apiRequest } from "../../utils/apiRequest";
import { useTitle } from "../../utils/useTitle";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { handleAuth } from "../../utils/reducers/reducer";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  classname: yup
    .string()
    .required("class is required")
    .min(5, "class must be 5 characters"),
});


const InputClass = () => {
  useTitle("List Members");
  const [className, setClassName] = useState("");
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [objSubmit, setObjSubmit] = useState({});
  const [cookie, setCookie, removeCookie] = useCookies();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (className) {
      setDisabled(true);
    } else {
      setDisabled(true);
    }
  }, [className]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const registerClass = async (data) => {
    const body = {
      class_name: className,
    };
    apiRequest("admin/classes", "post", body)
      .then((res) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Succes Created",
          showConfirmButton: true,
        });
      })
      .catch((err) => {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Invalid Input From Client",
          showConfirmButton: true,
        });
      })
      .finally(() => {
        fetchData();
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    apiRequest("admin/classes", "get")
      .then((res) => {
        const results = res.data;
        setDatas(results);
      })
      .catch((err) => {
        const data = err.response;
        if (err.response?.status === 401) {
          removeCookie("token");
          dispatch(handleAuth(false));
          navigate("/");
        }
        alert("Please re-login !");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    if (objSubmit.class_name.length == 0) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Data cannot be empty !",
        showConfirmButton: true,
      });
      return;
    }
    const body = {
      class_name: objSubmit.class_name,
      status: objSubmit.status,
    };

    apiRequest(`admin/classes/${objSubmit.id_class}`, "put", body)
      .then((res) => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Success Updated",
          showConfirmButton: true,
        });
      })
      .catch((err) => {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Failed Updated",
          showConfirmButton: true,
        });
      })
      .finally(() => {
        fetchData();
      });
  };

  const deleteClass = async (id_class) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do You Want to Delete This Class?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: `cancel`,
      confirmButtonText: "Yes, delete!",
    })
      .then((res) => {
        if (res.isConfirmed) {
          apiRequest(`admin/classes/${id_class}`, "delete");
          Swal.fire({
            text: "Class Succesfully Deleted",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
          });
        } else if (res.isDismissed == `cancel`) {
          alert("cancel button clicked");
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "There is problem on server.",
        });
      })
      .finally(() => {
        fetchData();
      });
  };

  return (
    <Layout>
      <div className="pb-9">
        <div className="md:space-y-1 mb-[3rem]">
          <h1 className="text-putih text-lg md:text-2xl font-medium">
            Add Class
          </h1>
          <p className="text-abu font-light text-[8px] md:text-sm ">
            Join the class to learn with each others.
          </p>
        </div>
        <form
          className="w-full h-[10rem] md:h-[13rem] bg-card rounded-xl md:rounded-[20px] text-xs md:text-lg mb-9 px-3 md:px-7 py-3"
          onSubmit={handleSubmit(registerClass)}
        >
          <div className="flex flex-col space-y-2 w-1/2">
            <p className="text-putih text-md md:text-lg">Class</p>
            <CustomInput
              id="input-class"
              category="Class"
              type="text"
              placeholder="Class Name"
              onChange={(e) => setClassName(e.target.value)}
              value={className}
              register={register}
              error={errors.classname?.message}
              name="classname"
            />
          </div>
          <div className="text-start md:mt-7 mt-3">
            <CustomButton id="btn-addClass" color="Primary" label="Add" />
          </div>
        </form>
        <div className="w-full h-[26rem] md:h-[18rem] bg-card rounded-xl md:rounded-[20px] text-xs md:text-lg overflow-auto mb-7">
          <div className="flex flex-row text-putih md:text-base  px-3 md:px-7 py-2 space-x-2 sticky top-0 z-10 bg-card border-abu border-opacity-50 border-b">
            <p className="w-[10%] text-center">No</p>
            <p className="w-[30%] text-center">Class Name</p>
            <p className="w-[30%] text-center">Number of Mentess</p>
            <p className="w-[20%] text-center">Status</p>
            <p className="w-[2%] text-center"></p>
          </div>
          <hr className="text-abu mx-3 border-abu border-opacity-50" />
          {loading ? (
            <p>Loading...</p>
          ) : (
            datas
              ?.sort((a, b) => b.id_class - a.id_class)
              .map((data, index) => (
                <ListClass
                  key={data.id_class}
                  index={index}
                  name={data.class_name}
                  student={data.total_student}
                  status={data.status}
                  onClickEdit={() => {
                    setObjSubmit({
                      id_class: data.id_class,
                      class_name: data.class_name,
                      status: data.status,
                    });
                  }}
                  onClickDelete={() => deleteClass(data?.id_class)}
                />
              ))
          )}
        </div>
      </div>
      {/* --modal edit class */}
      <input type="checkbox" id="modal-edit-class" className="modal-toggle" />
      <div className="modal ">
        <div className="modal-box w-1/2 bg-card p-14">
          <div className="flex flex-row justify-between">
            <h1 className="text-putih text-lg md:text-3xl font-medium">
              Edit Class
            </h1>
            <label
              htmlFor="modal-edit-class"
              className="hover:text-button px-4 pt-2 text-sm text-abu cursor-pointer"
            >
              ✕
            </label>
          </div>
          <form className="flex flex-col" onSubmit={handleEditClass}>
            <div className="flex flex-col space-y-2 my-5">
              <CustomInput
                id="input-class"
                placeholder="Class Name"
                category="Class"
                onChange={(e) =>
                  setObjSubmit({ ...objSubmit, class_name: e.target.value })
                }
                value={objSubmit.class_name}
                error={errors.class_name?.message}
              />
              <div className="w-1/2 flex flex-col space-y-2 ">
                <label htmlFor="dropdown-status" className="sr-only"></label>
                <select
                  id="dropdown-status"
                  className="border placeholder:text-abu text-xs text-putih focus:outline-none focus:border-putih border-abu font-light rounded-[10px] bg-card w-full pl-3 h-[3.4rem]"
                  onChange={(e) =>
                    setObjSubmit({ ...objSubmit, status: e.target.value })
                  }
                  value={objSubmit.status}
                >
                  <option value="active" id="active">
                    active
                  </option>
                  <option value="non_active" id="non_active">
                    non_active
                  </option>
                </select>
              </div>
            </div>
            <div className="flex justify-start">
              <CustomButton
                id="btn-submitEditClass"
                label="Submit"
                color="Primary"
              />
            </div>
          </form>
        </div>
      </div>
      {/* end modal */}
    </Layout>
  );
};

export default InputClass;
