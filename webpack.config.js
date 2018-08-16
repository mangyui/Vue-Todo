const path=require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HTMLPlugin=require('html-webpack-plugin')
const webpack =require('webpack')
const ExtractPlugin=require('extract-text-webpack-plugin')   //单独打包css  webpack4不能用了 可npm install --save-dev extract-text-webpack-plugin@next

const isDev=process.env.NODE_ENV==='development'

const config={
    target:'web',
    entry:path.join(__dirname,'src/index.js'),
    output:{
        filename:'bundle.[hash:8].js',
        path:path.join(__dirname,'dist')
    },
    module:{
        rules:[
          {
              test:/\.vue$/,
              loader:'vue-loader'
          },
          {
            test:/\.jsx$/,
            loader:'babel-loader'
        },
          /* {
            test:/\.css$/,
            use:[
                'style-loader',
                'css-loader'
            ]
          }, */
          
          {
            test:/\.(gif|jpg|jpeg|png|svg)$/,
            use:[
                {
                    loader:'url-loader',
                    options:{
                        limit:1024,
                        name:'[name]-aaa.[ext]'
                    }
                }
            ]
        }
        
        ]
    },
    plugins:[
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env':{
                NODE_ENV:isDev?'"development"':'"production"'
            }
        }),
        new HTMLPlugin()
    ]
}

if(isDev){     //开发环境（run dev)
    config.module.rules.push({
            test:/\.styl/,
            use:[
                'style-loader',
                'css-loader',
                {
                    loader:'postcss-loader',
                    options:{
                        sourceMap:true,
                    }
                },
                'stylus-loader'
            ]
    })
    config.devtool='#cheap-module-eval-source-map';   //调试器
    config.devServer={
        port:8080,
        host:'127.0.0.1',   //0.0.0.0  http://localhost:8080/
        overlay:{
            error:true,
        },
        hot:true
    },
    config.plugins.push(    //对应上面hot,局部更新组建，不刷新网页
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
}else{    //正式环境(run build)

    config.entry={           //分离JS文件
        app:path.join(__dirname,'src/index.js'),
        vendor:['vue']
    }

    config.output.filename='[name].[chunkhash:8].js'
   config.module.rules.push(
    {
        test:/\.styl/,
        use:ExtractPlugin.extract({
            fallback:'style-loader',
            use:[
                'css-loader',
                {
                    loader:'postcss-loader',
                    options:{
                        sourceMap:true,
                    }
                },
                'stylus-loader'
            ]
        })
      },
   )
   config.plugins.push(
    new ExtractPlugin('styles.[chunkhash:8].css'),    //contentHsah会报错
       // // 将类库文件单独打包出来
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendor'
        // })

        // webpack相关的代码单独打包
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'runtime'
        // })
    );

    config.optimization = {
        splitChunks: {
            cacheGroups: {                  // 这里开始设置缓存的 chunks
                commons: {
                    chunks: 'initial',      // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                    minSize: 0,             // 最小尺寸，默认0,
                    minChunks: 2,           // 最小 chunk ，默认1
                    maxInitialRequests: 5   // 最大初始化请求书，默认1
                },
                vendor: {
                    test: /node_modules/,   // 正则规则验证，如果符合就提取 chunk
                    chunks: 'initial',      // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                    name: 'vendor',         // 要缓存的 分隔出来的 chunk 名称
                    priority: 10,           // 缓存组优先级
                    enforce: true
                }
            }
        },
        runtimeChunk: true
    }
}


module.exports=config;