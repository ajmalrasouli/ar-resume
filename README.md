# #CloudGuruChallenge: Your resume in Azure
Here's what I came up with as a solution to the [Azure Resume Challenge](https://acloudguru.com/blog/engineering/cloudguruchallenge-your-resume-in-azure)

View it live [here](https://lemon-desert-05dc5301e.6.azurestaticapps.net)


Before going through these steps you’ll need to have an Azure account. If you don’t have one you can setup a free trial account at https://azure.microsoft.com/free. Let’s walk through each of these steps.

![Diagram](assets/img/diagram.png)

## Prerequisites

- [GitHub account](https://github.com/join)
- [Azure account](https://azure.microsoft.com/en-us/free)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [.NET Core 3.1 LTS](https://dotnet.microsoft.com/download/dotnet/3.1)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#install-the-azure-functions-core-tools)
- [Visual Studio Code](https://code.visualstudio.com)
- [Visual Code Extensions](https://code.visualstudio.com/docs/introvideos/extend)
  - [Azure Functions Extensions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
  - [C# Extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
  - [Azure Storage Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestorage)
- [Full solution](https://github.com/ACloudGuru-Resources/acg-project-azure-resume)

## Front-end resources

The front-end is a static site with HTML, CSS, and JavaScript. It's static and has a visitor counter. The visitor counter data fetched via an API call to an Azure Function.

## Back-end resources

The back-end is an [HTTP triggered](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=csharp) Azure Functions with Cosmos DB input and output binding. The Function is triggered, it retrieves the CosmosDB item, add +1 to it, and saves it and returns its value to the caller.

## CI/CD Resources

- This is how you can deploy a blob storage static site with [GitHub actions.](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-static-site-github-actions) Used in frontend.main.yml.


## Visitor Counter Badge (Free!)
Powered by Microsoft Azure

Visitor Counter Badge is a simple open-source utility you can use to display the number of visitors on a web page, repository, or profile. Every request to render the visitor count badge invokes an HTTP-triggered Azure function that dynamically generates an SVG image that you can apply on a web page, profile page, or repository. 

If you are further interested in learning the internals of this service, please read the Visitor Counter Badge article by Rahul Rai on
[https://thecloudblog.net/lab/serverless-visitor-counter-badge-with-azure-functions/]


#


![](https://badge.tcblabs.net/api/hc/arasouli/index)
