import '../assets/styles/footer.styl'

export default {
    data() {
        return {
            author: 'Mangyu',
            blog: 'xxx'
        }
    },
    render() {
        return (
            <div id="footer">
                <span>Power by {this.author}，欢迎访问作者博客：{this.blog}</span>
            </div>
        )
    }
}