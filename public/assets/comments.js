('use strict');
const e = React.createElement;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      message: '',
    };
    this.newsId = parseInt(window.location.href.split('/').reverse()[0]);
    const bearerToken = Cookies.get('authorization');

    this.socket = io(URL, {
      query: {
        newsId: this.newsId,
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: 'Bearer ' + bearerToken,
          },
        },
      },
    });
  }

  componentDidMount() {
    this.getAllComments();

    this.socket.on('newComment', (message) => {
      const comments = this.state.comments;
      comments.push(message);
      this.setState(comments);
    });
    this.socket.on('removeComment', (payload) => {
      const { id } = payload;

      const comments = this.state.comments.filter((c) => c.id !== id);
      this.setState({ comments });
    });
    this.socket.on('editComment', (payload) => {
      const { id, comment } = payload;
      const comments = [...this.state.comments];

      const indexEdit = comments.findIndex((c) => c.id === id);
      if (indexEdit !== -1) {
        comments[indexEdit] = comment;
      }
      this.setState({ comments });

      showModal(
        'Изменение комментария',
        `Комментарий с ID ${comment.id} был изменён пользователем ${comment.user.nickname}`,
      );
    });
  }

  getAllComments = async () => {
    const response = await fetch(`${URL}/comments/${this.newsId}`, {
      method: 'GET',
    });

    if (response.ok) {
      const comments = await response.json();
      this.setState({ comments });
    }
  };

  onChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  };

  createComment = () => {
    this.socket.emit('addComment', {
      newsId: this.newsId,
      message: this.state.message,
    });
  };

  updateComment = (commentId) => {
    location.href = `${URL}/comments/update/${commentId}`;
  };

  removeComment = (commentId) => {
    fetch(`${URL}/comments/${commentId}`, {
      method: 'DELETE',
    });
  };

  render() {
    const userId = parseInt(getCookie('userId'));
    const role = getCookie('role');
    return (
      <div>
        <form
          id="createCommentForm"
          className="row g-3 mt-3"
          data-newsid="{{this.news.id}}"
        >
          <div className="input-group mt-4">
            <input
              id="input-comment"
              name="message"
              type="text"
              className="form-control"
              placeholder="Напишите комментарий"
              aria-label="Форма комментария"
              aria-describedby="button-addon"
              onChange={this.onChange}
            ></input>
            <button
              className="btn btn-outline-secondary"
              type="button"
              id="button-addon"
              onClick={this.createComment}
            >
              Отправить
            </button>
          </div>
        </form>
        {this.state.comments.map((comment, index) => {
          return (
            <div key={index} className="card mt-3">
              <div className="card-header d-flex justify-content-between">
                <span>{comment.user.nickname}</span>
                <span>Comment #{comment.id}</span>
              </div>
              <div className="card-body d-flex justify-content-between">
                <p className="card-text">{comment.message}</p>
                {(comment.user.id === userId || role === 'admin') && (
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => this.updateComment(comment.id)}
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => this.removeComment(comment.id)}
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

const domContainer = document.querySelector('#comments');
if (domContainer) ReactDOM.render(e(Comments), domContainer);
