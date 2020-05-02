# Code review using Rails Best Practices

Analyze code statically by using [Rails Best Practices](https://github.com/flyerhzm/rails_best_practices) in Github actions

## Inputs

### `files`

Changes the path to a Rails application

### `options`

Changes `rails_best_practices` command line options.

Specify the options in JSON array format.
e.g.: `'["--vendor", "--spec"]'`

### `working_directory`

Changes the current working directory of the Node.js process

## Example usage

```yaml
name: Analyze code statically
"on": pull_request
jobs:
  rails_best_practices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Analyze code statically using Rails Best Practices
        uses: moneyforward/rails_best_practices-action@v0
```

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/moneyforward/rails_best_practices-action

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
