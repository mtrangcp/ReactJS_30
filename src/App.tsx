import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

interface Todo {
  id: string;
  content: string;
  isDone: boolean;
}

const API = "http://localhost:3000/todos";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [openDialogDel, setOpenDialogDel] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [todoDeleted, setTodoDeleted] = useState<Todo | null>(null);
  const [valueInput, setValueInput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);
  const [allDone, setAllDone] = useState<boolean>(false);

  const [listRender, setListRender] = useState<Todo[]>([]);

  async function getAllTodo() {
    try {
      setloading(true);
      const res = await axios.get(API);
      setTodos(res.data);
      setListRender(res.data);

      // check all
      if (res.data.find((el: Todo) => !el.isDone)) {
        setAllDone(false);
      } else {
        setAllDone(true);
      }
      return res.data;
    } catch (error) {
      console.error("Error: ", error);
      setTodos([]);
      setListRender([]);

      return [];
    } finally {
      setloading(false);
    }
  }

  useEffect(() => {
    getAllTodo();
  }, []);

  // delete
  const closeDialogDel = () => {
    setOpenDialogDel(false);
  };

  const openDialogDelete = (id: string) => {
    setOpenDialogDel(true);

    const result = todos.find((el) => el.id === id);
    if (result) {
      setTodoDeleted(result);
    } else {
      console.log("Không tìm thấy bản ghi cần xóa");
    }
  };

  const handClickBtnleDelete = async (id: string) => {
    try {
      setloading(true);

      await axios.delete(`${API}/${id}`);
      await getAllTodo();

      setOpenDialogDel(false);
      setTodoDeleted(null);
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setloading(false);
    }
  };

  // update
  const closeDialogEdit = () => {
    setOpenDialogEdit(false);
  };

  // create
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueInput(e.target.value.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (valueInput) {
      if (!todos.find((el) => el.content === valueInput)) {
        setError("");
        const newTodo: Todo = {
          id:
            todos.length > 0
              ? (parseInt(todos[todos.length - 1].id) + 1).toString()
              : "1",
          content: valueInput,
          isDone: false,
        };

        try {
          setloading(true);
          const res = await axios.post(API, newTodo);
          if (res.data) {
            await getAllTodo();
          } else {
            setError("Thêm thất bại");
          }
          setValueInput("");
        } catch (error) {
          console.error("Error: ", error);
        } finally {
          setloading(false);
        }
      } else {
        setError("Tên công việc không được trùng!");
      }
    } else {
      setError("Tên công việc không được để trống!");
    }
  };

  // change status - click chb
  const handleClickChb = async (id: string) => {
    const todo = todos.find((el) => el.id === id);
    if (todo) {
      try {
        setloading(true);

        const updatedItem: Todo = { ...todo, isDone: !todo.isDone };
        await axios.put(`${API}/${id}`, updatedItem);

        await getAllTodo();
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setloading(false);
      }
    } else {
      console.log("Không tìm thấy bản ghi có id: ", id);
    }
  };

  // filter

  return (
    <div className="container">
      <h2>QUẢN LÝ CÔNG VIỆC</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nhập tên công việc"
          value={valueInput}
          onChange={handleChangeInput}
        />
        <small>{error}</small>
        <button type="submit">Thêm công việc</button>
      </form>

      <div className="group-btn-top">
        <button>Tất cả</button>
        <button>Hoàn thành</button>
        <button>Đang thực hiện</button>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="list-data">
          {listRender.map((todo) => {
            return (
              <div className="item" key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => handleClickChb(todo.id)}
                />
                <p className={todo.isDone ? "text-under" : ""}>
                  {todo.content}
                </p>

                <div className="action">
                  <span>✏️</span>
                  <span onClick={() => openDialogDelete(todo.id)}>🗑️</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="group-btn-bottom">
        <button>Xóa công việc hoàn thành</button>
        <button>Xóa tất cả công việc</button>
      </div>

      {allDone && (
        <div className="all-done">Tất cả công việc đã hoàn thành</div>
      )}

      {/* dialog update */}
      {openDialogEdit && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Sửa công việc</h3>
              <button className="btn-close" onClick={closeDialogDel}>
                ✖
              </button>
            </div>

            <div className="dialog-body">
              <input type="text" />
            </div>

            <div className="dialog-footer">
              <button className="btn-cancel" onClick={closeDialogDel}>
                Hủy
              </button>
              <button
                className="btn-confirm-update"
                onClick={() =>
                  todoDeleted && handClickBtnleDelete(todoDeleted.id)
                }
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/*dialog delete  */}
      {openDialogDel && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Xác nhận</h3>
              <button className="btn-close" onClick={closeDialogDel}>
                ✖
              </button>
            </div>
            <div className="dialog-body">
              <span className="icon">ℹ️</span>
              <p>Có chắc chắn xóa: {todoDeleted?.content}</p>
            </div>
            <div className="dialog-footer">
              <button className="btn-cancel" onClick={closeDialogDel}>
                Hủy
              </button>
              <button
                className="btn-confirm"
                onClick={() =>
                  todoDeleted && handClickBtnleDelete(todoDeleted.id)
                }
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
